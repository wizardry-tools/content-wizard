import type { ComponentProps, FC } from 'react';

export function Icon(RawComponent: string, titleProp?: string): FC<ComponentProps<'svg'>> {
  const title = titleProp ?? extractName(RawComponent) ?? 'untitled svg';
  function IconComponent(props: ComponentProps<'svg'>) {
    return <RawComponent {...props} />;
  }
  IconComponent.displayName = title;
  return IconComponent;
}

function extractName(RawComponent: unknown) {
  if (
    RawComponent &&
    typeof RawComponent === 'object' &&
    'name' in RawComponent &&
    typeof RawComponent.name === 'string'
  ) {
    return (
      RawComponent.name
        .replace('Svg', '')
        // Insert a space before all caps
        .replaceAll(/([A-Z])/g, ' $1')
        .trimStart()
        .toLowerCase() + ' icon'
    );
  } else {
    return undefined;
  }
}
