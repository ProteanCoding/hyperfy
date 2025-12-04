import * as THREE from 'three'

export class ThreeProxy {
  static AmbientLight = THREE.AmbientLight
  static BoxGeometry = THREE.BoxGeometry
  static Clock = THREE.Clock
  static Color = THREE.Color
  static DirectionalLight = THREE.DirectionalLight
  static Group = THREE.Group
  static HemisphereLight = THREE.HemisphereLight
  static Material = THREE.Material
  static Mesh = THREE.Mesh
  static MeshBasicMaterial = THREE.MeshBasicMaterial
  static MeshStandardMaterial = THREE.MeshStandardMaterial
  static PerspectiveCamera = THREE.PerspectiveCamera
  static PlaneGeometry = THREE.PlaneGeometry
  static PointLight = THREE.PointLight
  static Quaternion = THREE.Quaternion
  static Raycaster = THREE.Raycaster
  static Scene = THREE.Scene
  static SphereGeometry = THREE.SphereGeometry
  static TextureLoader = THREE.TextureLoader
  static Vector3 = THREE.Vector3
  static VideoTexture = THREE.VideoTexture
  static WebGLRenderer = THREE.WebGLRenderer
}

// Include the number and string constants
for (var key in THREE) {
  if (['number', 'string'].includes(typeof THREE[key])) {
    ThreeProxy[key] = THREE[key]
  }
}
