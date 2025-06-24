import api from "@forge/api";
import { Logger } from "./utils/logger.js";

/**
 * Configuration Manager - Handles app settings and model configurations
 * Provides centralized configuration management with defaults and validation
 */
export class ConfigurationManager {
  static logger = new Logger("ConfigurationManager");

  /**
   * Default configuration structure
   */
  static getDefaultConfig() {
    return {
      // Core features
      enabled: true,
      autoAssign: false, // Start with suggestions only for safety
      autoSetPriority: false,
      allowReassignment: false,

      // AI Model Configuration
      selectedModel: "openai-gpt3.5", // Start with cheaper model
      minConfidenceThreshold: 0.6,

      // Model-specific configurations
      modelConfigs: {
        openai: {
          apiKey: null,
          models: ["openai-gpt3.5", "openai-gpt4"],
          rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 10000,
          },
        },
        anthropic: {
          apiKey: null,
          models: ["anthropic-claude"],
          rateLimits: {
            requestsPerMinute: 50,
          },
        },
        google: {
          apiKey: null,
          models: ["google-gemini"],
          rateLimits: {
            requestsPerMinute: 60,
          },
        },
      },

      // Filters and Scope
      projectFilter: [], // Empty = all projects
      issueTypeFilter: [], // Empty = all issue types
      componentFilter: [], // Empty = all components

      // Advanced Settings
      maxSimilarIssues: 10,
      similarIssueTimeRange: 30, // days
      enableFeedbackLearning: true,

      // Analytics and Logging
      enableAnalytics: true,
      logLevel: "info",
      retentionDays: 90,

      // Created/Updated metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "1.0.0",
    };
  }

  /**
   * Get current configuration from Forge storage
   */
  static async getConfiguration() {
    try {
      const stored = await api.asApp().storage.get("app-configuration");

      if (!stored) {
        this.logger.info("No configuration found, using defaults");
        const defaultConfig = this.getDefaultConfig();
        await this.saveConfiguration(defaultConfig);
        return defaultConfig;
      }

      // Merge with defaults to handle new settings
      const config = { ...this.getDefaultConfig(), ...stored };
      config.updatedAt = new Date().toISOString();

      this.logger.info("Loaded configuration", {
        enabled: config.enabled,
        model: config.selectedModel,
      });

      return config;
    } catch (error) {
      this.logger.error("Error loading configuration", {
        error: error.message,
      });

      // Return defaults if storage fails
      return this.getDefaultConfig();
    }
  }

  /**
   * Save configuration to Forge storage
   */
  static async saveConfiguration(config) {
    try {
      // Validate configuration before saving
      const validatedConfig = this.validateConfiguration(config);
      validatedConfig.updatedAt = new Date().toISOString();

      await api.asApp().storage.set("app-configuration", validatedConfig);

      this.logger.info("Configuration saved", {
        enabled: validatedConfig.enabled,
        model: validatedConfig.selectedModel,
      });

      return validatedConfig;
    } catch (error) {
      this.logger.error("Error saving configuration", { error: error.message });
      throw error;
    }
  }

  /**
   * Update specific configuration settings
   */
  static async updateConfiguration(updates) {
    try {
      const currentConfig = await this.getConfiguration();
      const newConfig = { ...currentConfig, ...updates };

      return await this.saveConfiguration(newConfig);
    } catch (error) {
      this.logger.error("Error updating configuration", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Validate configuration structure and values
   */
  static validateConfiguration(config) {
    const validated = { ...config };

    // Ensure required fields exist
    if (typeof validated.enabled !== "boolean") {
      validated.enabled = true;
    }

    if (typeof validated.autoAssign !== "boolean") {
      validated.autoAssign = false;
    }

    if (typeof validated.autoSetPriority !== "boolean") {
      validated.autoSetPriority = false;
    }

    // Validate model selection
    const validModels = [
      "openai-gpt3.5",
      "openai-gpt4",
      "anthropic-claude",
      "google-gemini",
    ];
    if (!validModels.includes(validated.selectedModel)) {
      this.logger.warn("Invalid model selected, defaulting to gpt-3.5", {
        model: validated.selectedModel,
      });
      validated.selectedModel = "openai-gpt3.5";
    }

    // Validate confidence threshold
    if (
      typeof validated.minConfidenceThreshold !== "number" ||
      validated.minConfidenceThreshold < 0 ||
      validated.minConfidenceThreshold > 1
    ) {
      validated.minConfidenceThreshold = 0.6;
    }

    // Ensure arrays exist
    validated.projectFilter = Array.isArray(validated.projectFilter)
      ? validated.projectFilter
      : [];
    validated.issueTypeFilter = Array.isArray(validated.issueTypeFilter)
      ? validated.issueTypeFilter
      : [];
    validated.componentFilter = Array.isArray(validated.componentFilter)
      ? validated.componentFilter
      : [];

    // Validate numeric settings
    if (
      typeof validated.maxSimilarIssues !== "number" ||
      validated.maxSimilarIssues < 1
    ) {
      validated.maxSimilarIssues = 10;
    }

    if (
      typeof validated.similarIssueTimeRange !== "number" ||
      validated.similarIssueTimeRange < 1
    ) {
      validated.similarIssueTimeRange = 30;
    }

    if (
      typeof validated.retentionDays !== "number" ||
      validated.retentionDays < 1
    ) {
      validated.retentionDays = 90;
    }

    return validated;
  }

  /**
   * Get model-specific configuration
   */
  static async getModelConfig(modelName) {
    try {
      const config = await this.getConfiguration();
      const modelType = this.getModelType(modelName);

      return config.modelConfigs[modelType] || null;
    } catch (error) {
      this.logger.error("Error getting model config", {
        error: error.message,
        modelName,
      });
      return null;
    }
  }

  /**
   * Update model-specific configuration
   */
  static async updateModelConfig(modelType, modelConfig) {
    try {
      const config = await this.getConfiguration();

      if (!config.modelConfigs[modelType]) {
        config.modelConfigs[modelType] = {};
      }

      config.modelConfigs[modelType] = {
        ...config.modelConfigs[modelType],
        ...modelConfig,
      };

      return await this.saveConfiguration(config);
    } catch (error) {
      this.logger.error("Error updating model config", {
        error: error.message,
        modelType,
      });
      throw error;
    }
  }

  /**
   * Extract model type from model name
   */
  static getModelType(modelName) {
    if (modelName.startsWith("openai-")) return "openai";
    if (modelName.startsWith("anthropic-")) return "anthropic";
    if (modelName.startsWith("google-")) return "google";
    return "unknown";
  }

  /**
   * Check if model is properly configured
   */
  static async isModelConfigured(modelName) {
    try {
      const modelConfig = await this.getModelConfig(modelName);
      if (!modelConfig) return false;

      // Check if API key is configured
      return Boolean(modelConfig.apiKey);
    } catch (error) {
      this.logger.error("Error checking model configuration", {
        error: error.message,
        modelName,
      });
      return false;
    }
  }

  /**
   * Get available models based on configuration
   */
  static async getAvailableModels() {
    try {
      const config = await this.getConfiguration();
      const availableModels = [];

      for (const [modelType, modelConfig] of Object.entries(
        config.modelConfigs
      )) {
        if (modelConfig.apiKey) {
          availableModels.push(...modelConfig.models);
        }
      }

      return availableModels;
    } catch (error) {
      this.logger.error("Error getting available models", {
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Reset configuration to defaults
   */
  static async resetToDefaults() {
    try {
      const defaultConfig = this.getDefaultConfig();
      await this.saveConfiguration(defaultConfig);

      this.logger.info("Configuration reset to defaults");
      return defaultConfig;
    } catch (error) {
      this.logger.error("Error resetting configuration", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Export configuration for backup
   */
  static async exportConfiguration() {
    try {
      const config = await this.getConfiguration();

      // Remove sensitive data for export
      const exportConfig = { ...config };
      if (exportConfig.modelConfigs) {
        for (const modelType of Object.keys(exportConfig.modelConfigs)) {
          if (exportConfig.modelConfigs[modelType].apiKey) {
            exportConfig.modelConfigs[modelType].apiKey = "[REDACTED]";
          }
        }
      }

      return exportConfig;
    } catch (error) {
      this.logger.error("Error exporting configuration", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get configuration summary for admin dashboard
   */
  static async getConfigurationSummary() {
    try {
      const config = await this.getConfiguration();

      return {
        enabled: config.enabled,
        selectedModel: config.selectedModel,
        autoAssign: config.autoAssign,
        autoSetPriority: config.autoSetPriority,
        configuredModels: await this.getAvailableModels(),
        projectsFilter: config.projectFilter.length,
        issueTypesFilter: config.issueTypeFilter.length,
        minConfidence: config.minConfidenceThreshold,
        lastUpdated: config.updatedAt,
      };
    } catch (error) {
      this.logger.error("Error getting configuration summary", {
        error: error.message,
      });
      throw error;
    }
  }
}
