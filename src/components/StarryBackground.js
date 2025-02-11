import React, { useEffect } from "react";
import { View, Animated, Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

const StarryBackground = () => {
  // Criar array de estrelas com posições aleatórias
  const stars = Array.from({ length: 100 }, () => ({
    left: Math.random() * width,
    top: Math.random() * height,
    size: Math.random() * 2 + 1,
    animationDuration: Math.random() * 2000 + 1000,
    opacity: new Animated.Value(Math.random()),
  }));

  useEffect(() => {
    // Animar cada estrela
    stars.forEach((star) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: Math.random(),
            duration: star.animationDuration,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.5,
            duration: star.animationDuration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      {stars.map((star, index) => (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#0A1128",
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
  },
});

export default StarryBackground;
