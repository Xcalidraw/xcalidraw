# Xcalidraw

**Xcalidraw** is exported as a component to be directly embedded in your project.

## Installation

Use `npm` or `yarn` to install the package.

```bash
npm install react react-dom @xcalidraw/xcalidraw
# or
yarn add react react-dom @xcalidraw/xcalidraw
```

> **Note**: If you don't want to wait for the next stable release and try out the unreleased changes, use `@xcalidraw/xcalidraw@next`.

#### Self-hosting fonts

By default, Xcalidraw will try to download all the used fonts from the [CDN](https://esm.run/@xcalidraw/xcalidraw/dist/prod).

For self-hosting purposes, you'll have to copy the content of the folder `node_modules/@xcalidraw/xcalidraw/dist/prod/fonts` to the path where your assets should be served from (i.e. `public/` directory in your project). In that case, you should also set `window.XCALIDRAW_ASSET_PATH` to the very same path, i.e. `/` in case it's in the root:

```js
<script>window.XCALIDRAW_ASSET_PATH = "/";</script>
```

### Dimensions of Xcalidraw

Xcalidraw takes _100%_ of `width` and `height` of the containing block so make sure the container in which you render Xcalidraw has non zero dimensions.

## Demo

Go to [CodeSandbox](https://codesandbox.io/p/sandbox/github/xcalidraw/xcalidraw/tree/master/examples/with-script-in-browser) example.

## Integration

Head over to the [docs](https://docs.xcalidraw.com/docs/@xcalidraw/xcalidraw/integration).

## API

Head over to the [docs](https://docs.xcalidraw.com/docs/@xcalidraw/xcalidraw/api).

## Contributing

Head over to the [docs](https://docs.xcalidraw.com/docs/@xcalidraw/xcalidraw/contributing).
