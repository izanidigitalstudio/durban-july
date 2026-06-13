import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from 'react-native';

type Props = Omit<ImageProps, 'source' | 'style'> & {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  fallbackAspectRatio?: number;
};

export default function AdaptiveImage({
  source,
  style,
  fallbackAspectRatio = 16 / 9,
  ...props
}: Props) {
  const [aspectRatio, setAspectRatio] = useState(fallbackAspectRatio);

  useEffect(() => {
    const uri = !Array.isArray(source) && typeof source === 'object'
      ? source.uri
      : undefined;

    if (uri) {
      Image.getSize(
        uri,
        (width, height) => {
          if (width > 0 && height > 0) {
            setAspectRatio(width / height);
          }
        },
        () => setAspectRatio(fallbackAspectRatio),
      );
    } else {
      setAspectRatio(fallbackAspectRatio);
    }
  }, [fallbackAspectRatio, source]);

  return (
    <Image
      {...props}
      source={source}
      resizeMode="contain"
      onLoad={(event) => {
        const { width, height } = event.nativeEvent.source ?? {};
        if (width && height) {
          setAspectRatio(width / height);
        }
        props.onLoad?.(event);
      }}
      style={[style, { width: '100%', height: undefined, aspectRatio }]}
    />
  );
}
