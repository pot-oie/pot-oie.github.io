import { selectDiverseRandom, shuffle } from "../../utils/space/randomSelection";

export function randomizeEditionMedia(root: HTMLElement): void {
  const filmCount = Number(root.dataset.filmCount);
  const trackCount = Number(root.dataset.trackCount);
  const artistLimit = Number(root.dataset.trackArtistLimit);
  const dateLimit = Number(root.dataset.trackDateLimit);
  const filmCandidates = [...root.querySelectorAll<HTMLElement>("[data-film-candidate]")];
  const trackCandidates = [...root.querySelectorAll<HTMLElement>("[data-track-candidate]")];

  if (!Number.isInteger(filmCount) || filmCandidates.length < filmCount || !Number.isInteger(trackCount) || trackCandidates.length < trackCount) return;

  filmCandidates.forEach((candidate) => {
    candidate.hidden = true;
    for (let slot = 1; slot <= filmCount; slot += 1) candidate.classList.remove(`film-poster--${slot}`);
  });
  shuffle(filmCandidates).slice(0, filmCount).forEach((candidate, index) => {
    candidate.hidden = false;
    candidate.classList.add(`film-poster--${index + 1}`);
    candidate.parentElement?.append(candidate);
  });

  trackCandidates.forEach((candidate) => { candidate.hidden = true; });
  selectDiverseRandom(trackCandidates, trackCount, [
    { key: (candidate) => candidate.dataset.trackArtist ?? "", max: artistLimit },
    { key: (candidate) => candidate.dataset.trackDate ?? "", max: dateLimit },
  ]).forEach((candidate, index) => {
    candidate.hidden = false;
    const number = candidate.querySelector<HTMLElement>(".track-number");
    if (number) number.textContent = String(index + 1).padStart(2, "0");
    candidate.parentElement?.append(candidate);
  });
}
