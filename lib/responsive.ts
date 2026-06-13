import { useWindowDimensions } from 'react-native';

const DESKTOP_GRID_BREAKPOINT = 900;

export function useCatalogueColumns() {
  const { width } = useWindowDimensions();

  return width >= DESKTOP_GRID_BREAKPOINT ? 2 : 1;
}
