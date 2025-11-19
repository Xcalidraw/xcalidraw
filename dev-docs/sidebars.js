/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: "category",
      label: "Introduction",
      link: {
        type: "doc",
        id: "introduction/get-started",
      },
      items: ["introduction/development", "introduction/contributing"],
    },
    {
      type: "category",
      label: "Codebase",
      items: ["codebase/json-schema", "codebase/frames"],
    },
    {
      type: "category",
      label: "@xcalidraw/xcalidraw",
      collapsed: false,
      items: [
        "@xcalidraw/xcalidraw/installation",
        "@xcalidraw/xcalidraw/integration",
        "@xcalidraw/xcalidraw/customizing-styles",
        {
          type: "category",
          label: "API",
          link: {
            type: "doc",
            id: "@xcalidraw/xcalidraw/api/api-intro",
          },
          items: [
            {
              type: "category",
              label: "Props",
              link: {
                type: "doc",
                id: "@xcalidraw/xcalidraw/api/props/props",
              },
              items: [
                "@xcalidraw/xcalidraw/api/props/initialdata",
                "@xcalidraw/xcalidraw/api/props/xcalidraw-api",
                "@xcalidraw/xcalidraw/api/props/render-props",
                "@xcalidraw/xcalidraw/api/props/ui-options",
              ],
            },
            {
              type: "category",
              label: "Children Components",
              link: {
                type: "doc",
                id: "@xcalidraw/xcalidraw/api/children-components/children-components-intro",
              },
              items: [
                "@xcalidraw/xcalidraw/api/children-components/main-menu",
                "@xcalidraw/xcalidraw/api/children-components/welcome-screen",
                "@xcalidraw/xcalidraw/api/children-components/sidebar",
                "@xcalidraw/xcalidraw/api/children-components/footer",
                "@xcalidraw/xcalidraw/api/children-components/live-collaboration-trigger",
              ],
            },
            {
              type: "category",
              label: "Utils",
              link: {
                type: "doc",
                id: "@xcalidraw/xcalidraw/api/utils/utils-intro",
              },
              items: [
                "@xcalidraw/xcalidraw/api/utils/export",
                "@xcalidraw/xcalidraw/api/utils/restore",
              ],
            },
            "@xcalidraw/xcalidraw/api/constants",
            "@xcalidraw/xcalidraw/api/xcalidraw-element-skeleton",
          ],
        },
        "@xcalidraw/xcalidraw/faq",
        "@xcalidraw/xcalidraw/development",
      ],
    },
    {
      type: "category",
      label: "@xcalidraw/mermaid-to-xcalidraw",
      link: {
        type: "doc",
        id: "@xcalidraw/mermaid-to-xcalidraw/installation",
      },
      items: [
        "@xcalidraw/mermaid-to-xcalidraw/api",
        "@xcalidraw/mermaid-to-xcalidraw/development",
        {
          type: "category",
          label: "Codebase",
          link: {
            type: "doc",
            id: "@xcalidraw/mermaid-to-xcalidraw/codebase/codebase",
          },
          items: [
            {
              type: "category",
              label: "How Parser works under the hood?",
              link: {
                type: "doc",
                id: "@xcalidraw/mermaid-to-xcalidraw/codebase/parser/parser",
              },
              items: [
                "@xcalidraw/mermaid-to-xcalidraw/codebase/parser/flowchart",
              ],
            },
            "@xcalidraw/mermaid-to-xcalidraw/codebase/new-diagram-type",
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
