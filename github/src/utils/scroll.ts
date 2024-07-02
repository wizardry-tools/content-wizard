


interface ScrollToIdProps {
  scrollToOptions?: ScrollToOptions,
  scrollIntoViewOptions?: ScrollIntoViewOptions,
  hook?: (callbackValue: any)=>void,
  hookProps?: any,
  offset?: number,
}

export const useScrollToId = (props?: ScrollToIdProps) => {
  const {
    scrollToOptions = {
      behavior: 'smooth'
    } as ScrollToOptions,
    scrollIntoViewOptions = {
      behavior: 'smooth',
      inline: 'start',
      block: 'end'
    } as ScrollIntoViewOptions,
    hook = ()=>{},
    offset = 128,
    hookProps
  } = props || {};

  const scroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const targetScroll = element.offsetTop - offset;
      element.scrollIntoView(scrollIntoViewOptions);
      window.scrollTo({
        ...scrollToOptions,
        top: targetScroll,
      });
      hook(hookProps);
    }
  };

  return {scroll};
}
