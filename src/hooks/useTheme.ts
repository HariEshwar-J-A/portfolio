import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleTheme, setTheme } from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const { mode, colors } = useSelector((state: RootState) => state.theme);

  const currentTheme = {
    mode,
    colors: {
      ...colors,
      current: mode === 'light' ? colors.light : colors.dark,
    },
  };

  return {
    theme: currentTheme,
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (mode: 'light' | 'dark') => dispatch(setTheme(mode)),
  };
};