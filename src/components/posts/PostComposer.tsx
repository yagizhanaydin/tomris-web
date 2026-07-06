"use client";

import { useState } from "react";
import {
  CITIES_TR,
  getDistricts,
  EU_COUNTRY_LIST,
  getEuCities,
  getCountryLabel,
  TR_COUNTRY,
} from "@/lib/locations";
import { useLanguage } from "@/context/LanguageProvider";
import { ContentBlockedError } from "@/lib/security/content-filter";
import type { PostAudience, PostRegion, PostLocationInput } from "@/types/post";

interface PostComposerProps {
  onPublish: (content: string, location: PostLocationInput, audience: PostAudience) => Promise<void>;
  disabled?: boolean;
}

export function PostComposer({ onPublish, disabled }: PostComposerProps) {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState("");
  const [region, setRegion] = useState<PostRegion>("tr");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [audience, setAudience] = useState<PostAudience>("all");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const districts = region === "tr" && city ? getDistricts(city) : [];
  const euCities = region === "eu" && country ? getEuCities(country) : [];

  const handleRegionChange = (next: PostRegion) => {
    setRegion(next);
    setCountry("");
    setCity("");
    setDistrict("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    setError("");

    if (!content.trim()) {
      setError(t.posts.errorEmpty);
      return;
    }
    if (region === "tr" && (!city || !district)) {
      setError(t.posts.errorLocationTr);
      return;
    }
    if (region === "eu" && (!country || !city)) {
      setError(t.posts.errorLocationEu);
      return;
    }

    setSubmitting(true);
    try {
      await onPublish(
        content,
        {
          region,
          country: region === "tr" ? TR_COUNTRY : country,
          city,
          district: region === "tr" ? district : "",
        },
        audience
      );
      setContent("");
      setCountry("");
      setCity("");
      setDistrict("");
      setAudience("all");
    } catch (err: unknown) {
      if (err instanceof ContentBlockedError) {
        setError(t.posts.errorBannedContent);
      } else {
        setError(t.posts.errorGeneric);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="font-semibold text-tomris">{t.posts.compose}</h2>
      {error && <div className="alert-error">{error}</div>}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t.posts.composePlaceholder}
        disabled={disabled || submitting}
        rows={4}
        maxLength={2000}
        className="input-field resize-none"
      />

      <fieldset disabled={disabled || submitting}>
        <legend className="text-xs text-tomris font-medium mb-2">{t.posts.region}</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "tr" as const, label: t.posts.regionTurkey },
              { value: "eu" as const, label: t.posts.regionEurope },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer text-sm ${
                region === opt.value
                  ? "selection-active"
                  : "border-[var(--border)] hover:border-violet-200"
              }`}
            >
              <input
                type="radio"
                name="region"
                value={opt.value}
                checked={region === opt.value}
                onChange={() => handleRegionChange(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {region === "tr" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.city}</span>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setDistrict("");
              }}
              disabled={disabled || submitting}
              required
              className="input-field text-sm py-2"
            >
              <option value="">{t.posts.selectCity}</option>
              {CITIES_TR.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.district}</span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={disabled || submitting || !city}
              required
              className="input-field text-sm py-2 disabled:opacity-50"
            >
              <option value="">{t.posts.selectDistrict}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.country}</span>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCity("");
              }}
              disabled={disabled || submitting}
              required
              className="input-field text-sm py-2"
            >
              <option value="">{t.posts.selectCountry}</option>
              {EU_COUNTRY_LIST.map((c) => (
                <option key={c} value={c}>
                  {getCountryLabel(c, locale)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.cityEu}</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={disabled || submitting || !country}
              required
              className="input-field text-sm py-2 disabled:opacity-50"
            >
              <option value="">{t.posts.selectCity}</option>
              {euCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <fieldset disabled={disabled || submitting}>
        <legend className="text-xs text-tomris font-medium mb-2">{t.posts.audience}</legend>
        <p className="text-xs text-[var(--muted)] mb-2">{t.posts.audienceHint}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {(
            [
              { value: "all" as const, label: t.posts.audienceAll },
              { value: "kadin" as const, label: t.posts.audienceWomen },
              { value: "erkek" as const, label: t.posts.audienceMen },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer text-sm ${
                audience === opt.value
                  ? "selection-active"
                  : "border-[var(--border)] hover:border-violet-200"
              }`}
            >
              <input
                type="radio"
                name="audience"
                value={opt.value}
                checked={audience === opt.value}
                onChange={() => setAudience(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={disabled || submitting} className="btn-primary sm:w-auto sm:px-8">
        {submitting ? t.posts.publishing : t.posts.publish}
      </button>
    </form>
  );
}
