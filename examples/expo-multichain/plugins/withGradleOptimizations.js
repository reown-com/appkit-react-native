const { withGradleProperties } = require('expo/config-plugins');

/**
 * Custom config plugin to add Gradle optimization properties
 * @param {import('expo/config-plugins').ExpoConfig} config
 */
const withGradleOptimizations = config => {
  return withGradleProperties(config, config => {
    const gradleProperties = config.modResults;

    // Update JVM arguments
    // Find and replace existing org.gradle.jvmargs or add new one
    const jvmArgsIndex = gradleProperties.findIndex(
      item => item.type === 'property' && item.key === 'org.gradle.jvmargs'
    );

    const jvmArgs = '-Xmx6144m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError';

    if (jvmArgsIndex > -1) {
      gradleProperties[jvmArgsIndex].value = jvmArgs;
    } else {
      gradleProperties.push({
        type: 'property',
        key: 'org.gradle.jvmargs',
        value: jvmArgs
      });
    }

    // Add or update Gradle optimization properties
    const optimizationProps = {
      'org.gradle.parallel': 'true',
      'org.gradle.caching': 'true',
      'org.gradle.configureondemand': 'true',
      'org.gradle.daemon': 'true'
    };

    Object.entries(optimizationProps).forEach(([key, value]) => {
      const existingIndex = gradleProperties.findIndex(
        item => item.type === 'property' && item.key === key
      );

      if (existingIndex > -1) {
        gradleProperties[existingIndex].value = value;
      } else {
        gradleProperties.push({
          type: 'property',
          key,
          value
        });
      }
    });

    return config;
  });
};

module.exports = withGradleOptimizations;
