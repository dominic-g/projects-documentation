// import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import { useMDXComponents as getMDXComponents } from '@mdx-js/react';

// const docsComponents = getDocsMDXComponents();
const docsComponents = getMDXComponents();

export const useMDXComponents = (components?: any): any => ({
  ...docsComponents,
  ...components,
});
