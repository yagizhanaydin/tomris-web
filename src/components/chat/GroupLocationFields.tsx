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
import type { PostRegion, PostLocationInput } from "@/types/post";

interface GroupLocationFieldsProps {
  location: PostLocationInput;
  onChange: (location: PostLocationInput) => void;
  disabled?: boolean;
}

export function GroupLocationFields({ location, onChange, disabled }: GroupLocationFieldsProps) {
  const { t, locale } = useLanguage();
  const districts = location.region === "tr" && location.city ? getDistricts(location.city) : [];
  const euCities = location.region === "eu" && location.country ? getEuCities(location.country) : [];

  const setRegion = (region: PostRegion) => {
    onChange({ region, country: "", city: "", district: "" });
  };

  return (
    <div className="space-y-3">
      <fieldset disabled={disabled}>
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
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer text-sm ${
                location.region === opt.value
                  ? "selection-active"
                  : "border-[var(--border)] hover:border-violet-200"
              }`}
            >
              <input
                type="radio"
                name="groupRegion"
                checked={location.region === opt.value}
                onChange={() => setRegion(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {location.region === "tr" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.city}</span>
            <select
              value={location.city}
              onChange={(e) => onChange({ ...location, city: e.target.value, district: "" })}
              disabled={disabled}
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
              value={location.district}
              onChange={(e) => onChange({ ...location, district: e.target.value })}
              disabled={disabled || !location.city}
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
              value={location.country}
              onChange={(e) => onChange({ ...location, country: e.target.value, city: "" })}
              disabled={disabled}
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
              value={location.city}
              onChange={(e) => onChange({ ...location, city: e.target.value })}
              disabled={disabled || !location.country}
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
    </div>
  );
}

export function defaultGroupLocation(): PostLocationInput {
  return { region: "tr", country: TR_COUNTRY, city: "", district: "" };
}

interface GroupFiltersBarProps {
  filters: import("@/types/chat").GroupFilters;
  onChange: (filters: import("@/types/chat").GroupFilters) => void;
}

export function GroupFiltersBar({ filters, onChange }: GroupFiltersBarProps) {
  const { t, locale } = useLanguage();
  const districts = filters.region === "tr" && filters.city ? getDistricts(filters.city) : [];
  const euCities = filters.region === "eu" && filters.country ? getEuCities(filters.country) : [];

  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-semibold text-tomris">{t.posts.filters}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.region}</span>
          <select
            value={filters.region}
            onChange={(e) =>
              onChange({ region: e.target.value as PostRegion | "", country: "", city: "", district: "" })
            }
            className="input-field text-sm py-2"
          >
            <option value="">{t.posts.filterAll}</option>
            <option value="tr">{t.posts.regionTurkey}</option>
            <option value="eu">{t.posts.regionEurope}</option>
          </select>
        </label>

        {filters.region === "tr" && (
          <>
            <label className="block">
              <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.city}</span>
              <select
                value={filters.city}
                onChange={(e) => onChange({ ...filters, city: e.target.value, district: "" })}
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
            {filters.city && (
              <label className="block sm:col-span-2">
                <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.district}</span>
                <select
                  value={filters.district}
                  onChange={(e) => onChange({ ...filters, district: e.target.value })}
                  className="input-field text-sm py-2"
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
          </>
        )}

        {filters.region === "eu" && (
          <>
            <label className="block">
              <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.country}</span>
              <select
                value={filters.country}
                onChange={(e) => onChange({ ...filters, country: e.target.value, city: "" })}
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
            {filters.country && (
              <label className="block">
                <span className="text-xs text-tomris font-medium mb-1 block">{t.posts.cityEu}</span>
                <select
                  value={filters.city}
                  onChange={(e) => onChange({ ...filters, city: e.target.value })}
                  className="input-field text-sm py-2"
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
          </>
        )}
      </div>
    </div>
  );
}
