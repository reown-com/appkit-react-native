import type { TransactionImage } from '@reown/appkit-common-react-native';

import { FlexView } from '../../layout/wui-flex';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { useTheme } from '../../hooks/useTheme';
import styles from './styles';

export interface TransactionVisualProps {
  images?: TransactionImage[];
  networkSrc?: string;
  isAllNFT?: boolean;
}

export function TransactionVisual({ images, networkSrc, isAllNFT }: TransactionVisualProps) {
  const Theme = useTheme();
  const backgroundColor = Theme['bg-200'];
  const isFirstNFT = Boolean(images?.[0]?.type === 'NFT');
  const filteredImages = images?.filter(image => image.url);
  const [firstImage, secondImage] = filteredImages ?? [];
  const hasOneImage = filteredImages?.length === 1;
  const hasTwoImages = filteredImages && filteredImages?.length > 1;

  return (
    <FlexView>
      {!filteredImages?.length && (
        <FlexView
          alignItems="center"
          justifyContent="center"
          style={[styles.image, { backgroundColor }]}
        >
          <Icon name={isFirstNFT ? 'nftPlaceholder' : 'coinPlaceholder'} size="sm" color="fg-200" />
        </FlexView>
      )}
      {hasOneImage && firstImage?.url ? <Image
          source={firstImage.url}
          style={[styles.image, firstImage?.type === 'NFT' && styles.imageNft, { backgroundColor }]}
        /> : null}
      {hasTwoImages && firstImage?.url && secondImage?.url ? <FlexView flexDirection="row" padding={['0', 's', '0', '0']}>
          <FlexView style={styles.halfContainer}>
            <Image
              source={firstImage.url}
              style={[styles.image, isAllNFT && styles.imageNft, { backgroundColor }]}
            />
          </FlexView>
          <FlexView style={styles.halfContainer}>
            <Image
              source={secondImage.url}
              style={[
                styles.image,
                styles.halfRight,
                isAllNFT && styles.imageNft,
                { backgroundColor }
              ]}
            />
          </FlexView>
        </FlexView> : null}
      <FlexView
        alignItems="center"
        justifyContent="center"
        style={[
          styles.networkImageContainer,
          { borderColor: Theme['bg-100'], backgroundColor: Theme['bg-200'] }
        ]}
      >
        {networkSrc ? (
          <Image source={networkSrc} style={styles.networkImage} />
        ) : (
          <Icon name="networkPlaceholder" size="xxs" color="fg-200" />
        )}
      </FlexView>
    </FlexView>
  );
}
