const CHUNK_PUBLIC_PATH = "server/pages/_app.js";
const runtime = require("../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/styles_globals_ff5908.css");
runtime.loadChunk("server/chunks/ssr/_a0118e._.js");
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/pages/_app.js [ssr] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
