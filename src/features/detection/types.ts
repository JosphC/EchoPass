export type BusNearbyListener = (busId: string) => void;
export type LostListener = () => void;
export type Unsubscribe = () => void;

export interface DetectionService {
  onBusNearby(listener: BusNearbyListener): Unsubscribe;
  listenForUltrasound(durationMs: number): Promise<boolean>;
  onLost(listener: LostListener): Unsubscribe;
}
