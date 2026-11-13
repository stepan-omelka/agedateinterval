type Style = Record<string, string | number>;
type Child = ImageNode | string | false | undefined;

/**
 * An element of the tree Satori lays out. Satori reads the shape of a React element
 * (`type` and `props`), so a plain object does the job and the API needs neither React nor JSX.
 */
export type ImageNode = {
  readonly type: string;
  readonly props: {
    readonly style?: Style;
    readonly children?: ImageNode | string | readonly (ImageNode | string)[];
    readonly [attribute: string]: unknown;
  };
};

/** Builds an {@link ImageNode}; a `false` or `undefined` child is left out, as in JSX. */
export function h(
  type: string,
  props: { style?: Style; [attribute: string]: unknown },
  ...children: Child[]
): ImageNode {
  const shown = children.filter(child => child !== false && child !== undefined);
  return { type, props: { ...props, children: shown.length === 1 ? shown[0] : shown } };
}
