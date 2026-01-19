import Image from "@tiptap/extension-image";

export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: "large",
        parseHTML: (element) => element.getAttribute("data-size") || "large",
        renderHTML: (attributes) => ({
          "data-size": attributes.size,
        }),
      },
      position: {
        default: "center",
        parseHTML: (element) =>
          element.getAttribute("data-position") || "center",
        renderHTML: (attributes) => ({
          "data-position": attributes.position,
        }),
      },
      caption: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-caption") || "",
        renderHTML: (attributes) => ({
          "data-caption": attributes.caption,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { size, position, caption, ...rest } = HTMLAttributes;
    return [
      "figure",
      {
        class: `article-image size-${size} position-${position}`,
        "data-size": size,
        "data-position": position,
        "data-caption": caption,
      },
      ["img", rest],
      caption ? ["figcaption", {}, caption] : "",
    ];
  },

  parseHTML() {
    return [
      {
        tag: "figure.article-image",
        getAttrs: (node) => {
          if (typeof node === "string") return {};
          const element = node as HTMLElement;
          const img = element.querySelector("img");
          const figcaption = element.querySelector("figcaption");
          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            title: img?.getAttribute("title"),
            size: element.getAttribute("data-size") || "large",
            position: element.getAttribute("data-position") || "center",
            caption: figcaption?.textContent || "",
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (node) => {
          if (typeof node === "string") return {};
          const element = node as HTMLElement;
          return {
            src: element.getAttribute("src"),
            alt: element.getAttribute("alt"),
            title: element.getAttribute("title"),
          };
        },
      },
    ];
  },
});
