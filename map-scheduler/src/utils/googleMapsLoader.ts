import { Loader } from '@googlemaps/js-api-loader';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
let loader: Loader | null = null;

export async function loadGoogleMaps(libraries: Array<'places' | 'geometry' | 'maps' | 'routes'> = ['places']) {
  if (!loader) {
    loader = new Loader({
      apiKey: API_KEY,
      version: 'weekly',
      libraries,
    });
  }
  return loader.load();
}
