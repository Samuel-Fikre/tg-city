"use client";

import { Text } from "@react-three/drei";
import type { DistrictZone } from "@/lib/github";

interface DistrictLabelProps {
  district: DistrictZone;
}

export default function DistrictLabel({ district }: DistrictLabelProps) {
  const [cx, , cz] = district.center;
  const labelText = district.name.toUpperCase();

  return (
    <group position={[cx, 100, cz]}>
      {/* Main label floating high above district */}
      <Text
        fontSize={15}
        color={district.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.5}
        outlineColor="#000000"
        outlineOpacity={0.8}
        material-transparent={true}
        material-opacity={0.9}
      >
        {labelText}
      </Text>
      {/* Secondary line with population */}
      <Text
        position={[0, -12, 0]}
        fontSize={6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.3}
        outlineColor="#000000"
        outlineOpacity={0.6}
        material-transparent={true}
        material-opacity={0.7}
      >
        {`${district.population.toLocaleString()} CHANNELS`}
      </Text>
    </group>
  );
}
