import{_ as s,c as a,o as e,a as n}from"./app.33d01bd4.js";const u=JSON.parse('{"title":"Getting Started","description":"","frontmatter":{},"headers":[{"level":2,"title":"What is vuse-rx?","slug":"what-is-vuse-rx","link":"#what-is-vuse-rx","children":[]},{"level":2,"title":"Install & Use","slug":"install-use","link":"#install-use","children":[{"level":3,"title":"NPM / YARN","slug":"npm-yarn","link":"#npm-yarn","children":[]},{"level":3,"title":"UMD","slug":"umd","link":"#umd","children":[]}]}],"relativePath":"guide/getting-started.md","lastUpdated":1674343081000}'),t={name:"guide/getting-started.md"},l=n(`<h1 id="getting-started" tabindex="-1">Getting Started <a class="header-anchor" href="#getting-started" aria-hidden="true">#</a></h1><h2 id="what-is-vuse-rx" tabindex="-1"><a href="/guide/">What is <code>vuse-rx</code>?</a> <a class="header-anchor" href="#what-is-vuse-rx" aria-hidden="true">#</a></h2><p><code>vuse-rx</code> is a bridge library: it connects vue&#39;s reactive states and refs with RxJS observables and subjects in a way that enforces separation of concerns and reduces boilerplate code.</p><p>It&#39;s fully typed and therefore has <strong>first-class TypeScript support</strong>.</p><p><a href="/guide/">More details here</a>.</p><h2 id="install-use" tabindex="-1">Install &amp; Use <a class="header-anchor" href="#install-use" aria-hidden="true">#</a></h2><h3 id="npm-yarn" tabindex="-1">NPM / YARN <a class="header-anchor" href="#npm-yarn" aria-hidden="true">#</a></h3><p><code>npm i vuse-rx</code></p><p><code>yarn add vuse-rx</code></p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#89DDFF;font-style:italic;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">useRxState</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">syncRef</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> ... </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">vuse-rx</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span></code></pre></div><h3 id="umd" tabindex="-1">UMD <a class="header-anchor" href="#umd" aria-hidden="true">#</a></h3><div class="language-html"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#89DDFF;">&lt;</span><span style="color:#F07178;">script</span><span style="color:#89DDFF;"> </span><span style="color:#C792EA;">src</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">https://unpkg.com/vuse-rx</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">&gt;&lt;/</span><span style="color:#F07178;">script</span><span style="color:#89DDFF;">&gt;</span></span>
<span class="line"><span style="color:#89DDFF;">&lt;</span><span style="color:#F07178;">script</span><span style="color:#89DDFF;">&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;"> useRxState</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> syncRef</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> ... </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> vuseRx</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">&lt;/</span><span style="color:#F07178;">script</span><span style="color:#89DDFF;">&gt;</span></span>
<span class="line"></span></code></pre></div><p>See <a href="/recipes/counter">recipes</a> or <a href="/api/use-rx-state">api</a> for detailed usage instructions and full list of exports.</p>`,13),p=[l];function o(r,c,i,d,D,y){return e(),a("div",null,p)}const F=s(t,[["render",o]]);export{u as __pageData,F as default};