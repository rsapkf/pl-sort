export const secToHHMMSS = (totalSeconds) => {
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = Math.floor(totalSeconds % 60);

  hours = hours === 0 ? `` : `${hours}:`;
  minutes = minutes < 1 ? `0` : minutes;
  seconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${hours}${minutes}:${seconds}`;
};
