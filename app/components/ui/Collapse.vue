<template>
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <slot />
  </Transition>
</template>

<script setup lang="ts">
const onEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.height = "0";
  element.style.opacity = "0";
  element.style.overflow = "hidden";

  const height = element.scrollHeight;

  requestAnimationFrame(() => {
    element.style.transition =
      "height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease";
    element.style.height = `${height}px`;
    element.style.opacity = "1";
  });

  element.addEventListener("transitionend", function handler(e) {
    if (e.propertyName === "height") {
      element.removeEventListener("transitionend", handler);
      element.style.height = "auto";
      element.style.overflow = "";
      done();
    }
  });
};

const onLeave = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.height = `${element.scrollHeight}px`;
  element.style.overflow = "hidden";

  requestAnimationFrame(() => {
    element.style.transition =
      "height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease";
    element.style.height = "0";
    element.style.opacity = "0";
  });

  element.addEventListener("transitionend", function handler(e) {
    if (e.propertyName === "height") {
      element.removeEventListener("transitionend", handler);
      done();
    }
  });
};
</script>
