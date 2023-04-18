export type RouterProps = {
  isPortrait: boolean;
  windowHeight: number;
  windowWidth: number;
  isDarkMode: boolean;
  onCopyClipboard?: (value: string) => void;
};
