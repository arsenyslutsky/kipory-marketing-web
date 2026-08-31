import type { CSSProperties } from 'react';

export type FormControlVisualProps = {
  padding?: number;
  margin?: number;
  horizontalPadding?: number;
  horizontalMargin?: number;
  fontSize?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  focusedBackgroundColor?: string;
  focusedBackgroundOpacity?: number;
};

export function createFormControlStyle(
  {
    padding,
    margin,
    horizontalPadding,
    horizontalMargin,
    fontSize,
    backgroundColor,
    backgroundOpacity,
    focusedBackgroundColor,
    focusedBackgroundOpacity,
  }: FormControlVisualProps,
  style?: CSSProperties,
) {
  return {
    ...(padding === undefined ? {} : { '--form-control-padding': `${padding}px` }),
    ...(margin === undefined ? {} : { '--form-control-margin': `${margin}px` }),
    ...(horizontalPadding === undefined
      ? {}
      : { '--form-control-horizontal-padding': `${horizontalPadding}px` }),
    ...(horizontalMargin === undefined
      ? {}
      : { '--form-control-horizontal-margin': `${horizontalMargin}px` }),
    ...(fontSize === undefined ? {} : { fontSize: `${fontSize}px` }),
    ...(backgroundColor === undefined
      ? {}
      : { '--form-control-background': backgroundColor }),
    ...(backgroundOpacity === undefined
      ? {}
      : { '--form-control-background-opacity': `${backgroundOpacity * 100}%` }),
    ...(focusedBackgroundColor === undefined
      ? {}
      : { '--form-control-focused-background': focusedBackgroundColor }),
    ...(focusedBackgroundOpacity === undefined
      ? {}
      : {
          '--form-control-focused-background-opacity': `${focusedBackgroundOpacity * 100}%`,
        }),
    ...style,
  } as CSSProperties;
}
