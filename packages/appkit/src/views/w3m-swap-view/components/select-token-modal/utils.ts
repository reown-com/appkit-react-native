import { type SwapTokenWithBalance } from '@reown/appkit-common-react-native';
import { SwapController } from '@reown/appkit-core-react-native';

export function filterTokens(tokens?: SwapTokenWithBalance[], searchValue?: string) {
  if (!tokens) {
    return [];
  }

  if (!searchValue) {
    return tokens;
  }

  return tokens.filter(
    token =>
      token.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchValue.toLowerCase())
  );
}

export function createSections(
  isSourceToken: boolean,
  searchValue: string,
  balances?: SwapTokenWithBalance[]
) {
  const myTokensFiltered = filterTokens(balances ?? [], searchValue);
  const popularFiltered = isSourceToken
    ? []
    : filterTokens(SwapController.getFilteredPopularTokens(balances), searchValue);

  const sections = [];
  if (myTokensFiltered.length > 0) {
    sections.push({ title: 'Your tokens', data: myTokensFiltered });
  }
  if (popularFiltered.length > 0) {
    sections.push({ title: 'Popular tokens', data: popularFiltered });
  }

  return sections;
}
