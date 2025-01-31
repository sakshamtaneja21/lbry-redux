// @flow
const isProduction = process.env.NODE_ENV === 'production';
const channelNameMinLength = 1;
const claimIdMaxLength = 40;

// see https://spec.lbry.com/#urls
export const regexInvalidURI = /[ =&#:$@%?;/\\"<>%{}|^~[\]`\u{0000}-\u{0008}\u{000b}-\u{000c}\u{000e}-\u{001F}\u{D800}-\u{DFFF}\u{FFFE}-\u{FFFF}]/u;
export const regexAddress = /^(b|r)(?=[^0OIl]{32,33})[0-9A-Za-z]{32,33}$/;
const regexPartProtocol = '^((?:lbry://)?)';
const regexPartStreamOrChannelName = '([^:$#/]*)';
const regexPartModifierSeparator = '([:$#]?)([^/]*)';
const queryStringBreaker = '^([\\S]+)([?][\\S]*)';
const separateQuerystring = new RegExp(queryStringBreaker);

/**
 * Parses a LBRY name into its component parts. Throws errors with user-friendly
 * messages for invalid names.
 *
 * Returns a dictionary with keys:
 *   - path (string)
 *   - isChannel (boolean)
 *   - streamName (string, if present)
 *   - streamClaimId (string, if present)
 *   - channelName (string, if present)
 *   - channelClaimId (string, if present)
 *   - primaryClaimSequence (int, if present)
 *   - secondaryClaimSequence (int, if present)
 *   - primaryBidPosition (int, if present)
 *   - secondaryBidPosition (int, if present)
 */

export function parseURI(URL: string, requireProto: boolean = false): LbryUrlObj {
  // Break into components. Empty sub-matches are converted to null

  const componentsRegex = new RegExp(
    regexPartProtocol + // protocol
    regexPartStreamOrChannelName + // stream or channel name (stops at the first separator or end)
    regexPartModifierSeparator + // modifier separator, modifier (stops at the first path separator or end)
    '(/?)' + // path separator, there should only be one (optional) slash to separate the stream and channel parts
      regexPartStreamOrChannelName +
      regexPartModifierSeparator
  );
  // chop off the querystring first
  let QSStrippedURL, qs;
  const qsRegexResult = separateQuerystring.exec(URL);
  if (qsRegexResult) {
    [QSStrippedURL, qs] = qsRegexResult.slice(1).map(match => match || null);
  }

  const cleanURL = QSStrippedURL || URL;
  const regexMatch = componentsRegex.exec(cleanURL) || [];
  const [proto, ...rest] = regexMatch.slice(1).map(match => match || null);
  const path = rest.join('');
  const [
    streamNameOrChannelName,
    primaryModSeparator,
    primaryModValue,
    pathSep,
    possibleStreamName,
    secondaryModSeparator,
    secondaryModValue,
  ] = rest;

  // Validate protocol
  if (requireProto && !proto) {
    throw new Error(__('LBRY URLs must include a protocol prefix (lbry://).'));
  }

  // Validate and process name
  if (!streamNameOrChannelName) {
    throw new Error(__('URL does not include name.'));
  }

  rest.forEach(urlPiece => {
    if (urlPiece && urlPiece.includes(' ')) {
      throw new Error('URL can not include a space');
    }
  });

  const includesChannel = streamNameOrChannelName.startsWith('@');
  const isChannel = streamNameOrChannelName.startsWith('@') && !possibleStreamName;
  const channelName = includesChannel && streamNameOrChannelName.slice(1);

  if (includesChannel) {
    if (!channelName) {
      throw new Error(__('No channel name after @.'));
    }

    if (channelName.length < channelNameMinLength) {
      throw new Error(
        __(`Channel names must be at least %channelNameMinLength% characters.`, {
          channelNameMinLength,
        })
      );
    }
  }

  // Validate and process modifier
  const [primaryClaimId, primaryClaimSequence, primaryBidPosition] = parseURIModifier(
    primaryModSeparator,
    primaryModValue
  );
  const [secondaryClaimId, secondaryClaimSequence, secondaryBidPosition] = parseURIModifier(
    secondaryModSeparator,
    secondaryModValue
  );
  const streamName = includesChannel ? possibleStreamName : streamNameOrChannelName;
  const streamClaimId = includesChannel ? secondaryClaimId : primaryClaimId;
  const channelClaimId = includesChannel && primaryClaimId;

  return {
    isChannel,
    path,
    ...(streamName ? { streamName } : {}),
    ...(streamClaimId ? { streamClaimId } : {}),
    ...(channelName ? { channelName } : {}),
    ...(channelClaimId ? { channelClaimId } : {}),
    ...(primaryClaimSequence ? { primaryClaimSequence: parseInt(primaryClaimSequence, 10) } : {}),
    ...(secondaryClaimSequence
      ? { secondaryClaimSequence: parseInt(secondaryClaimSequence, 10) }
      : {}),
    ...(primaryBidPosition ? { primaryBidPosition: parseInt(primaryBidPosition, 10) } : {}),
    ...(secondaryBidPosition ? { secondaryBidPosition: parseInt(secondaryBidPosition, 10) } : {}),

    // The values below should not be used for new uses of parseURI
    // They will not work properly with canonical_urls
    claimName: streamNameOrChannelName,
    claimId: primaryClaimId,
    ...(streamName ? { contentName: streamName } : {}),
    ...(qs ? { queryString: qs } : {}),
  };
}

function parseURIModifier(modSeperator: ?string, modValue: ?string) {
  let claimId;
  let claimSequence;
  let bidPosition;

  if (modSeperator) {
    if (!modValue) {
      throw new Error(__(`No modifier provided after separator %modSeperator%.`, { modSeperator }));
    }

    if (modSeperator === '#') {
      claimId = modValue;
    } else if (modSeperator === ':') {
      claimSequence = modValue;
    } else if (modSeperator === '$') {
      bidPosition = modValue;
    }
  }

  if (claimId && (claimId.length > claimIdMaxLength || !claimId.match(/^[0-9a-f]+$/))) {
    throw new Error(__(`Invalid claim ID %claimId%.`, { claimId }));
  }

  if (claimSequence && !claimSequence.match(/^-?[1-9][0-9]*$/)) {
    throw new Error(__('Claim sequence must be a number.'));
  }

  if (bidPosition && !bidPosition.match(/^-?[1-9][0-9]*$/)) {
    throw new Error(__('Bid position must be a number.'));
  }

  return [claimId, claimSequence, bidPosition];
}

/**
 * Takes an object in the same format returned by parse() and builds a URI.
 *
 * The channelName key will accept names with or without the @ prefix.
 */
export function buildURI(
  UrlObj: LbryUrlObj,
  includeProto: boolean = true,
  protoDefault: string = 'lbry://'
): string {
  const {
    streamName,
    streamClaimId,
    channelName,
    channelClaimId,
    primaryClaimSequence,
    primaryBidPosition,
    secondaryClaimSequence,
    secondaryBidPosition,
    ...deprecatedParts
  } = UrlObj;
  const { claimId, claimName, contentName } = deprecatedParts;

  if (!isProduction) {
    if (claimId) {
      console.error(
        __("'claimId' should no longer be used. Use 'streamClaimId' or 'channelClaimId' instead")
      );
    }
    if (claimName) {
      console.error(
        __(
          "'claimName' should no longer be used. Use 'streamClaimName' or 'channelClaimName' instead"
        )
      );
    }
    if (contentName) {
      console.error(__("'contentName' should no longer be used. Use 'streamName' instead"));
    }
  }

  if (!claimName && !channelName && !streamName) {
    console.error(
      __(
        "'claimName', 'channelName', and 'streamName' are all empty. One must be present to build a url."
      )
    );
  }

  const formattedChannelName =
    channelName && (channelName.startsWith('@') ? channelName : `@${channelName}`);
  const primaryClaimName = claimName || contentName || formattedChannelName || streamName;
  const primaryClaimId = claimId || (formattedChannelName ? channelClaimId : streamClaimId);
  const secondaryClaimName =
    (!claimName && contentName) || (formattedChannelName ? streamName : null);
  const secondaryClaimId = secondaryClaimName && streamClaimId;

  return (
    (includeProto ? protoDefault : '') +
    // primaryClaimName will always exist here because we throw above if there is no "name" value passed in
    // $FlowFixMe
    primaryClaimName +
    (primaryClaimId ? `#${primaryClaimId}` : '') +
    (primaryClaimSequence ? `:${primaryClaimSequence}` : '') +
    (primaryBidPosition ? `${primaryBidPosition}` : '') +
    (secondaryClaimName ? `/${secondaryClaimName}` : '') +
    (secondaryClaimId ? `#${secondaryClaimId}` : '') +
    (secondaryClaimSequence ? `:${secondaryClaimSequence}` : '') +
    (secondaryBidPosition ? `${secondaryBidPosition}` : '')
  );
}

/* Takes a parseable LBRY URL and converts it to standard, canonical format */
export function normalizeURI(URL: string) {
  const {
    streamName,
    streamClaimId,
    channelName,
    channelClaimId,
    primaryClaimSequence,
    primaryBidPosition,
    secondaryClaimSequence,
    secondaryBidPosition,
  } = parseURI(URL);

  return buildURI({
    streamName,
    streamClaimId,
    channelName,
    channelClaimId,
    primaryClaimSequence,
    primaryBidPosition,
    secondaryClaimSequence,
    secondaryBidPosition,
  });
}

export function isURIValid(URL: string): boolean {
  try {
    parseURI(normalizeURI(URL));
  } catch (error) {
    return false;
  }

  return true;
}

export function isNameValid(claimName: string) {
  return !regexInvalidURI.test(claimName);
}

export function isURIClaimable(URL: string) {
  let parts;
  try {
    parts = parseURI(normalizeURI(URL));
  } catch (error) {
    return false;
  }

  return parts && parts.streamName && !parts.streamClaimId && !parts.isChannel;
}

export function convertToShareLink(URL: string) {
  const {
    streamName,
    streamClaimId,
    channelName,
    channelClaimId,
    primaryBidPosition,
    primaryClaimSequence,
    secondaryBidPosition,
    secondaryClaimSequence,
  } = parseURI(URL);
  return buildURI(
    {
      streamName,
      streamClaimId,
      channelName,
      channelClaimId,
      primaryBidPosition,
      primaryClaimSequence,
      secondaryBidPosition,
      secondaryClaimSequence,
    },
    true,
    'https://open.lbry.com/'
  );
}
