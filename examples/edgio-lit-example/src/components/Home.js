import { prefetch } from '@edgio/prefetch/window'

const Home = ({ name } = pageProps) => {
  prefetch('/about')
  return window.html`
    <div class="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-5 md:px-0">
        <div class="flex w-full flex-row flex-wrap justify-center md:w-[700px]">
          <div class="flex w-[330px] flex-col items-start justify-start rounded p-5 md:w-1/2">
            <h1 class="text-xl font-bold text-white">Lit with Edgio</h1>
            <h3 class="mt-2 mb-2 text-lg text-[#FFFFFF75]">Edgio supports all of the most powerful features of Lit!</h3>
            <a class="mt-auto text-[#01B18D] hover:underline" href="https://docs.edgio.co/guides/lit" target="_blank">
              Learn More →
            </a>
          </div>
          <div class="flex w-[330px] flex-col items-start justify-start rounded p-5 md:w-1/2">
            <h1 class="text-xl font-bold text-white">React with Edgio</h1>
            <h3 class="mt-2 mb-2 text-lg text-[#FFFFFF75]">Edgio supports all of the most powerful features of React!</h3>
            <a class="mt-auto text-[#01B18D] hover:underline" href="https://docs.edgio.co/guides/react" target="_blank">
              Learn More →
            </a>
          </div>
          <div class="flex w-[330px] flex-col items-start justify-start rounded p-5 md:w-1/2">
            <h1 class="text-xl font-bold text-white">Caching with Edgio</h1>
            <h3 class="mt-2 mb-5 text-lg text-[#FFFFFF75]">
              While most CDNs only cache content on your asset URLs, Edgio caches content on your page URLs using EdgeJS, allowing you to control
              caching within your application code.
            </h3>
            <a class="mt-auto text-[#01B18D] hover:underline" href="https://docs.edgio.co/guides/caching" target="_blank">
              Learn More →
            </a>
          </div>
          <div class="flex w-[330px] flex-col items-start justify-start rounded p-5 md:w-1/2">
            <h1 class="text-xl font-bold text-white">Edgio Prefetching</h1>
            <h3 class="mt-2 text-lg text-[#FFFFFF75]">
              Edgio allows you to speed up the user’s browsing experience by prefetching pages and API calls that they are likely to need.
            </h3>
            <a class="mt-auto text-[#01B18D] hover:underline" href="https://docs.edgio.co/guides/prefetching" target="_blank">
              Learn More →
            </a>
          </div>
        </div>
      </div>
  `
}

export default Home
