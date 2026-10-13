import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { WalletItem } from '../../types';
import { PassCardView } from './PassCardView';
import { WalletCard } from './WalletCard';

interface CarouselPageProps {
  item: WalletItem;
  active: boolean;
  isDefault: boolean;
  onFront: (id: string) => void;
  onSetDefault: (id: string) => void;
  width: number;
}

export function CarouselPage({ item, active, isDefault, onFront, onSetDefault, width }: CarouselPageProps) {
  const [expanded, setExpanded] = useState(true);
  useEffect(() => {
    setExpanded(active);
  }, [active]);

  return (
    <View style={{ width }} testID={`card-page-${item.id}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.kind === 'card' ? `Card •••• ${item.last4}` : item.id}
        onPress={() => {
          if (active) setExpanded((e) => !e);
          else onFront(item.id);
        }}
        onLongPress={() => onSetDefault(item.id)}
      >
        {item.kind === 'card' ? (
          <WalletCard item={item} isDefault={isDefault} expanded={active && expanded} />
        ) : (
          <PassCardView item={item} isDefault={isDefault} />
        )}
      </Pressable>
    </View>
  );
}
