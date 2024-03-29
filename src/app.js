import React, { useState } from "react";
import dayjs from "dayjs";

import styles from "./app.module.css";

import { getPlaylistVideosData } from "./services/youtube-api";

import { secToHHMMSS } from "./utils/sec-to-hhmmss";
import { formatNumber } from "./utils/format-views";

import loadingSvg from "./assets/loading.svg";

const examplePlaylist = "PLlaN88a7y2_q16UdiTcsWnr0gFIcDMhHX";
const idFromUrl = new URLSearchParams(window.location.search).get("id");
const parsePlaylistId = (str) => {
  if (!str) return examplePlaylist;
  if (str.startsWith("PL")) return str;
  return new URLSearchParams(new URL(str).search).get("list") || "Invalid";
};

const App = () => {
  const [formData, setFormData] = useState({
    playlistId: idFromUrl,
    sortBy: "views",
    sortOrder: "default",
    disabled: false,
  });
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState([]);

  let displayData = [];
  if (response) {
    displayData =
      formData.sortBy === "views"
        ? [...response].sort((a, b) => b.views - a.views)
        : formData.sortBy === "likes"
        ? [...response].sort((a, b) => b.likes - a.likes)
        : formData.sortBy === "comments"
        ? [...response].sort((a, b) => b.comments - a.comments)
        : formData.sortBy === "duration"
        ? [...response].sort((a, b) => b.duration - a.duration)
        : formData.sortBy === "title"
        ? [...response].sort((a, b) => a.title.localeCompare(b.title))
        : formData.sortBy === "date"
        ? [...response].sort(
            (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
          )
        : [...response];

    if (formData.sortOrder === "reversed") {
      displayData.reverse();
    }
  }

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      disabled: false,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResponse([]);
    setFormData({ ...formData, disabled: true });

    let id = parsePlaylistId(formData.playlistId);
    if (id === "Invalid") {
      setError("Invalid URL");
    } else {
      if (id === examplePlaylist) {
        setFormData({
          ...formData,
          playlistId: examplePlaylist,
          disabled: true,
        });
      }
      let res = await getPlaylistVideosData(id);
      if (res.error) {
        setError(res.error);
      } else {
        setResponse(res.videos);
      }
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1>pl-sort</h1>
      <div>
        <p>Sort YouTube playlists by various metrics.</p>
        <div>
          <a href="https://github.com/rsapkf/pl-sort">Source</a> <br />
        </div>
      </div>
      <form onSubmit={onSubmit} className={styles.form}>
        <input
          type="text"
          name="playlistId"
          id="playlistId"
          placeholder="Playlist id or link (Click Sort for demo)"
          value={formData.playlistId}
          onChange={onChange}
          className={styles.playlistId}
          autoFocus
        />
        <div className={styles.options}>
          <select
            name="sortBy"
            id="sortBy"
            defaultValue={formData.sortBy}
            onChange={onChange}
            className={styles.sortBy}
          >
            <option value="views">Views</option>
            <option value="duration">Duration</option>
            <option value="title">Title</option>
            <option value="date">Date published</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
            <option value="default">Default</option>
          </select>
          {displayData.length > 0 && (
            <button
              type="button"
              title="Reverse the order"
              name="sortOrder"
              id="sortOrder"
              onClick={() =>
                setFormData((formData) => ({
                  ...formData,
                  sortOrder:
                    formData.sortOrder === "default" ? "reversed" : "default",
                }))
              }
              className={styles.sortOrder}
              style={{
                background:
                  formData.sortOrder === "reversed" ? "#303030" : "transparent",
              }}
            >
              ⇅
            </button>
          )}
          <button
            type="submit"
            title="Submit"
            className={styles.submit}
            disabled={formData.disabled}
          >
            Sort
          </button>
        </div>
      </form>
      {loading && (
        <div className={styles.loading}>
          <img src={loadingSvg} alt="Loading" />
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
      {displayData.length > 0 && (
        <>
          <div>
            Length:{" "}
            <b>
              {secToHHMMSS(
                displayData
                  .map((item) => item.duration)
                  .reduce((a, b) => a + b, 0)
              )}
            </b>{" "}
            (<b>{displayData.length}</b> video
            {displayData.length > 1 ? "s" : ""}) &middot;{" "}
            <a
              href={`https://www.youtube.com/playlist?list=${
                parsePlaylistId(formData.playlistId) || examplePlaylist
              }`}
              target="_blank"
              rel="noreferrer noopener"
            >
              View on YouTube
            </a>
          </div>
          <div className={styles.results}>
            {displayData.map((video, idx) => (
              <div key={video.id} className={styles.result}>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.resultLink}
                >
                  <div className={styles.resultIndex}>{idx + 1}</div>
                  <div className={styles.thumbnail}>
                    <img
                      src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                      alt={`Link to YouTube`}
                      loading="lazy"
                      className={styles.img}
                    />
                    <div className={styles.duration}>
                      {secToHHMMSS(video.duration)}
                    </div>
                  </div>
                  <div>
                    <div className={styles.resultTitle}>{video.title} </div>{" "}
                    <div className={styles.resultDetails}>
                      {formatNumber(video.views)} views &middot;{" "}
                      {dayjs(video.publishedAt).format("MMM D, YYYY")} &middot;{" "}
                      {formatNumber(video.likes)} like
                      {video.likes > 1 ? "s" : ""} &middot;{" "}
                      {formatNumber(video.comments)} comment
                      {video.comments > 1 ? "s" : ""}
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
