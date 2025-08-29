// import the URL string for the file under /public
import simJsUrl from '/sim.js?url';

export async function loadSim() {
  // Prevent Vite from trying to transform the URL at build-time
  const { default: ModuleFactory } = await import(/* @vite-ignore */ simJsUrl);
  return ModuleFactory();
}
