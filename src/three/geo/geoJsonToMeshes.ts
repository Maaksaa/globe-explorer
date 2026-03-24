import * as THREE from "three/webgpu";
import earcut from "earcut";

const RADIUS = 1.001; // чуть больше сферы (1.0), чтобы страны были "над" океаном

/**
 * Конвертирует (longitude, latitude) в 3D-координаты на сфере
 */
function latLonToVec3(lat: number, lon: number): THREE.Vector3 {
	const phi = (90 - lat) * (Math.PI / 180); // широта → полярный угол
	const theta = (lon + 180) * (Math.PI / 180); // долгота → азимутальный угол

	return new THREE.Vector3(
		-RADIUS * Math.sin(phi) * Math.cos(theta), // x
		RADIUS * Math.cos(phi), // y
		RADIUS * Math.sin(phi) * Math.sin(theta) // z
	);
}

/**
 * Создаёт один Mesh из массива координат полигона
 * ring = [[lon, lat], [lon, lat], ...]
 */
function createPolygonMesh(ring: number[][]): THREE.Mesh | null {
	if (ring.length < 3) return null;

	// === 1. Триангуляция (2D) ===
	// earcut работает с плоскими координатами [x, y, x, y, ...]
	// Используем lon/lat как плоские координаты для триангуляции
	const flatCoords: number[] = [];
	for (const point of ring) {
		flatCoords.push(point[0], point[1]); // lon, lat
	}

	// earcut возвращает индексы треугольников: [0, 1, 2, 1, 3, 2, ...]
	const indices = earcut(flatCoords);
	if (indices.length === 0) return null;

	// === 2. Проекция на сферу (3D) ===
	const vertices: number[] = [];
	for (const point of ring) {
		const v = latLonToVec3(point[1], point[0]); // lat, lon
		vertices.push(v.x, v.y, v.z);
	}

	// === 3. Создаём BufferGeometry ===
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
	geometry.setIndex(indices);
	geometry.computeVertexNormals(); // нормали для освещения

	// === 4. Материал ===
	const material = new THREE.MeshStandardMaterial({
		color: 0x3a7c3a, // зелёный (земля)
		roughness: 0.7,
		side: THREE.DoubleSide, // видно с обеих сторон
	});

	return new THREE.Mesh(geometry, material);
}

/**
 * Данные одной страны для создания мешей
 */
export interface CountryGeoData {
	iso: string; // ISO A3 код ("UKR", "USA", ...)
	name: string; // Название страны
	coordinates: number[][][] | number[][][][]; // полигоны
	type: "Polygon" | "MultiPolygon";
}

/**
 * Создаёт Group с мешами полигонов одной страны
 */
export function createCountryMeshes(country: CountryGeoData): THREE.Group {
	const group = new THREE.Group();
	group.name = country.iso; // для удобства поиска

	if (country.type === "Polygon") {
		// coordinates = [outerRing, hole1, hole2, ...]
		// Берём только внешний контур [0]
		// Polygon → number[][][] → первый ring = number[][]
		const rings = country.coordinates as number[][][];
		const mesh = createPolygonMesh(rings[0]);
		if (mesh) group.add(mesh);
	} else {
		// MultiPolygon — несколько полигонов (например, Индонезия — много островов)
		// coordinates = [[polygon1], [polygon2], ...]
		for (const polygon of country.coordinates as number[][][][]) {
			const mesh = createPolygonMesh(polygon[0]); // внешний контур каждого полигона
			if (mesh) group.add(mesh);
		}
	}

	return group;
}
