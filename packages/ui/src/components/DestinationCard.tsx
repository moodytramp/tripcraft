import React from 'react';
import { TCView, TCText, TCPressable, TCImage } from '../primitives/index';
import type { EligibleDestination } from '@tripcraft/types';

interface DestinationCardProps {
  destination: EligibleDestination;
  onPress?: (destination: EligibleDestination) => void;
}

export function DestinationCard({ destination, onPress }: DestinationCardProps) {
  return (
    <TCPressable
      onPress={() => onPress?.(destination)}
      testID={`destination-card-${destination.countryCode}`}
      accessibilityLabel={`${destination.countryName} - ${destination.visaStatusLabel}`}
      style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <TCView>
        {destination.imageUrl && (
          <TCImage
            src={destination.imageUrl}
            alt={destination.countryName}
            style={{ width: '100%', height: 160, objectFit: 'cover' as unknown as undefined }}
          />
        )}
        <TCView style={{ padding: 12 }}>
          <TCView style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TCText style={{ fontSize: 18, fontWeight: 'bold' }}>
              {destination.countryName}
            </TCText>
            <TCText style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
              {destination.visaStatusLabel}
            </TCText>
          </TCView>
          <TCView style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {destination.avgTemperature !== null && (
              <TCText style={{ fontSize: 14, color: '#6b7280' }}>
                {destination.avgTemperature}°C
              </TCText>
            )}
            {destination.estimatedMinCostUsd !== null && (
              <TCText style={{ fontSize: 16, fontWeight: 'bold', color: '#1d4ed8' }}>
                From ${destination.estimatedMinCostUsd}
              </TCText>
            )}
          </TCView>
        </TCView>
      </TCView>
    </TCPressable>
  );
}
