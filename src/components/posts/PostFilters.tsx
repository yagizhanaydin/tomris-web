"use client";

import {
  CITIES_TR,
  getDistricts,
  EU_COUNTRY_LIST,
  getEuCities,
  getCountryLabel,
} from "@/lib/locations";
import { useLanguage } from "@/context/LanguageProvider";
import type { PostFilters as Filters, DateFilter, PostAudience, PostRegion } from "@/types/post";
import type { Gender } from "@/types/user";

interface PostFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function PostFiltersBar({ filters, onChange }: PostFiltersProps) {
  const { t, locale } = useLanguage();

  const isTr = filters.region === "tr" || filters.region === "";
  const isEu = filters.region === "eu";

  const districts =
    isTr && filters.city && !EU_COUNTRY_LIST.includes(filters.city)
      ? getDistricts(filters.city)
      : [];

  const euCities = isEu && filters.country ? getEuCities(filters.country) : [];

  const set = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  const handleRegionChange = (region: PostRegion | "") => {
    onChange({
      ...filters,
      region,
      country: "",
      city: "",
      district: "",
    });
  };

  return (
    <div className="card space-y-3">
      <h2 className="font-semibold text-tomris text-sm">{t.posts.filters}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="text-xs text-[var(--muted)] mb-1 block">{t.posts.region}</span>
          <select
            value={filters.region}
            onChange={(e) => handleRegionChange(e.target.value as PostRegion | "")}
            className="input-field text-sm py-2"
          >
            <option value="">{t.posts.filterAll}</option>
            <option value="tr">{t.posts.regionTurkey}</option>
            <option value="eu">{t.posts.regionEurope}</option>
          </select>
        </label>

        {isEu && (
          <label className="block">
            <span className="text-xs text-[var(--muted)] mb-1 block">{t.posts.filterCountry}</span>
            <select
              value={filters.country}
              onChange={(e) => set({ country: e.target.value, city: "", district: "" })}
              className="input-field text-sm py-2"
            >
              <option value="">{t.posts.filterAll}</option>
              {EU_COUNTRY_LIST.map((c) => (
                <option key={c} value={c}>
                  {getCountryLabel(c, locale)}
                </option>
              ))}
            </select>
          </label>
        )}

        {isTr && (
          <label className="block">
            <span className="text-xs text-[var(--muted)] mb-1 block">{t.posts.filterCity}</span>
            <select
              value={filters.city}
              onChange={(e) => set({ city: e.target.value, district: "" })}
              className="input-field text-sm py-2"
            >
              <option value="">{t.posts.filterAll}</option>
              {CITIES_TR.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}

        {isEu && (
          <label className="block">
            <span className="text-xs text-[var(--muted)] mb-1 block">{t.posts.filterCity}</span>
            <select
              value={filters.city}
              onChange={(e) => set({ city: e.target.value })}
              disabled={!filters.country}
              className="input-field text-sm py-2 disabled:opacity-50"
            >
              <option value="">{t.posts.filterAll}</option>
              {euCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}

        {isTr && (
          <label className="block">
            <span className="text-xs text-[var(--muted)] mb-1 block">{t.posts.filterDistrict}</span>
            <select
              value={filters.district}
              onChange={(e) => set({ district: e.target.value })}
              disabled={!filters.city}
              className="input-field text-sm py-2 disabled:opacity-50"
            >
              <option value="">{t.posts.filterAll}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="text-xs text-[var(--muted)] mb-1 block">{t.posts.filterAuthorGender}</span>
          <select
            value={filters.authorGender}
            onChange={(e) => set({ authorGender: e.target.value as Gender | "" })}
            className="input-field text-sm py-2"
          >
            <option value="">{t.posts.filterAll}</option>
            <option value="kadin">{t.posts.filterFemale}</option>
            <option value="erkek">{t.posts.filterMale}</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-[var(--muted)] mb-1 block">{t.posts.filterAudience}</span>
          <select
            value={filters.audience}
            onChange={(e) => set({ audience: e.target.value as PostAudience | "" })}
            className="input-field text-sm py-2"
          >
            <option value="">{t.posts.filterAll}</option>
            <option value="all">{t.posts.audienceAll}</option>
            <option value="kadin">{t.posts.audienceWomen}</option>
            <option value="erkek">{t.posts.audienceMen}</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-[var(--muted)] mb-1 block">{t.posts.filterDate}</span>
          <select
            value={filters.dateRange}
            onChange={(e) => set({ dateRange: e.target.value as DateFilter })}
            className="input-field text-sm py-2"
          >
            <option value="all">{t.posts.dateAll}</option>
            <option value="today">{t.posts.dateToday}</option>
            <option value="week">{t.posts.dateWeek}</option>
            <option value="month">{t.posts.dateMonth}</option>
          </select>
        </label>
      </div>
    </div>
  );
}
