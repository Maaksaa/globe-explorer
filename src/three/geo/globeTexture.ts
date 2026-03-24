import { geoEquirectangular, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import * as THREE from "three/webgpu";
import worldAtlas from "world-atlas/countries-50m.json";
import type { Feature } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

// Размер текстуры. Должен быть 2:1 для equirectangular.
const WIDTH = 4096;
const HEIGHT = 2048;

const OCEAN = "#1a3a5c";
const LAND = "#3a7c3a";
const HOVERED = "#5cb85c";
const SELECTED = "#e8c547";
const BORDER = "#1a4a2c";

// ─────────────────────────────────────────────
// Тип страны
// ─────────────────────────────────────────────

export interface CountryEntry {
	id: string;
	name: string;
	feature: Feature;
}

// ─────────────────────────────────────────────
// Создание канвас-текстуры
// ─────────────────────────────────────────────

/**
 * Рисует страны на 2D canvas через d3-geo (equirectangular projection)
 * и оборачивает его в THREE.CanvasTexture.
 *
 * d3-geo сам обрабатывает anti-meridian, полюса и все граничные случаи —
 * никаких проблем с Россией или любой другой страной.
 *
 * THREE.SphereGeometry использует equirectangular UV-маппинг, поэтому
 * текстура накладывается на сферу без дополнительных преобразований.
 */
export function createGlobeTexture() {
	// ── canvas ────────────────────────────────
	const canvas = document.createElement("canvas");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	const ctx = canvas.getContext("2d")!;

	// ── d3-geo projection ─────────────────────
	// geoEquirectangular: longitude → X, latitude → Y (с переворотом).
	// scale = WIDTH / 2π делает карту шириной ровно WIDTH пикселей.
	// translate центрирует: lon=0 / lat=0 в центре canvas.
	const projection = geoEquirectangular()
		.scale(WIDTH / (2 * Math.PI))
		.translate([WIDTH / 2, HEIGHT / 2]);

	const path = geoPath(projection, ctx);

	// ── GeoJSON features ──────────────────────
	const geojson = topoFeature(
		worldAtlas as unknown as Topology,
		(
			worldAtlas as unknown as Topology<{
				countries: GeometryCollection;
			}>
		).objects.countries
	);

	const countries: CountryEntry[] = geojson.features.map((f) => ({
		id: String(f.id ?? ""),
		name: (f.properties as { name?: string } | null)?.name ?? "",
		feature: f as Feature,
	}));

	// ── draw ──────────────────────────────────
	function draw(hoveredId?: string, selectedId?: string) {
		// Заливаем океан
		ctx.fillStyle = OCEAN;
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		for (const { id, feature } of countries) {
			if (id === selectedId) {
				ctx.fillStyle = SELECTED;
			} else if (id === hoveredId) {
				ctx.fillStyle = HOVERED;
			} else {
				ctx.fillStyle = LAND;
			}

			// d3-geo рисует полигон на canvas
			ctx.beginPath();
			path(feature);
			ctx.fill();

			// Граница между странами
			ctx.strokeStyle = BORDER;
			ctx.lineWidth = 0.8;
			ctx.stroke();
		}
	}

	// Первоначальная отрисовка
	draw();

	// ── texture ───────────────────────────────
	const texture = new THREE.CanvasTexture(canvas);

	return { texture, countries, draw };
}
