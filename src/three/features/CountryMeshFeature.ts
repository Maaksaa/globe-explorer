import * as THREE from "three/webgpu";
import {  Object3DFeature } from "@vladkrutenyuk/three-kvy-core";
import type {CoreContext, IFeaturable } from "@vladkrutenyuk/three-kvy-core";
import type { GlobeModules } from "../createGlobeContext";

// Цвета состояний страны
const COLOR_DEFAULT = new THREE.Color(0x3a7c3a); // зелёный
const COLOR_HOVERED = new THREE.Color(0x5cb85c); // светло-зелёный
const COLOR_SELECTED = new THREE.Color(0xe8c547); // золотой

interface CountryMeshFeatureProps {
	iso: string;
	name: string;
}

export class CountryMeshFeature extends Object3DFeature<GlobeModules> {
	// ISO A3 код страны — "UKR", "USA" и т.д.
	readonly iso: string;
	// Название страны
	readonly name: string;

	private isHovered = false;
	private isSelected = false;
	// Все меши полигонов этой страны
	private meshes: THREE.Mesh[] = [];

	constructor(object: IFeaturable, props: CountryMeshFeatureProps) {
		super(object);
		this.iso = props.iso;
		this.name = props.name;
	}

	protected useCtx(_ctx: CoreContext<GlobeModules>) {
		// Собираем все меши из дочерних объектов группы
		this.object.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				this.meshes.push(child as THREE.Mesh);
			}
		});

		return () => {
			this.meshes = [];
		};
	}

	setHovered(value: boolean) {
		this.isHovered = value;
		this.updateColor();
	}

	setSelected(value: boolean) {
		this.isSelected = value;
		this.updateColor();
	}

	private updateColor() {
		// Приоритет: selected > hovered > default
		let color: THREE.Color;
		if (this.isSelected) {
			color = COLOR_SELECTED;
		} else if (this.isHovered) {
			color = COLOR_HOVERED;
		} else {
			color = COLOR_DEFAULT;
		}

		// Применяем цвет ко всем мешам страны
		for (const mesh of this.meshes) {
			const mat = mesh.material as THREE.MeshStandardMaterial;
			mat.color.set(color);
		}
	}
}
