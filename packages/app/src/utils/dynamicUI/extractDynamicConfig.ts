import { defaultConfigLoader } from '@backstage/core-app-api';
import { Entity } from '@backstage/catalog-model';
import { isKind } from '@backstage/plugin-catalog';
import { hasAnnotation, isType } from '../../components/catalog/utils';
import {
  DynamicModuleEntry,
  MenuItem,
  RouteBinding,
  ScalprumMountPointConfigRaw,
  ScalprumMountPointConfigRawIf,
} from '../../components/DynamicRoot/DynamicRootContext';

type AppConfig = {
  context: string;
  data: {
    dynamicPlugins?: {
      frontend?: {
        [key: string]: CustomProperties;
      };
    };
  };
};

type DynamicRoute = {
  scope: string;
  module: string;
  importName: string;
  path: string;
  menuItem?: MenuItem;
};

export type MountPoint = {
  scope: string;
  mountPoint: string;
  module: string;
  importName: string;
  config?: ScalprumMountPointConfigRaw;
};

type AppIcon = {
  scope: string;
  name: string;
  module: string;
  importName: string;
};

type CustomProperties = {
  dynamicRoutes?: (DynamicModuleEntry & {
    importName?: string;
    module?: string;
    path: string;
  })[];
  routeBindings?: RouteBinding[];
  mountPoints?: MountPoint[];
  appIcons?: AppIcon[];
};

const conditionsArrayMapper = (
  condition:
    | {
        [key: string]: string | string[];
      }
    | Function,
) => {
  if (typeof condition === 'function') {
    return (entity: Entity) => Boolean(condition(entity));
  }
  if (condition.isKind) {
    return isKind(condition.isKind);
  }
  if (condition.isType) {
    return isType(condition.isType);
  }
  if (condition.hasAnnotation) {
    return hasAnnotation(condition.hasAnnotation as string);
  }
  return () => false;
};

export const configIfToCallable =
  (conditional: ScalprumMountPointConfigRawIf) => (e: Entity) => {
    if (conditional?.allOf) {
      return conditional.allOf.map(conditionsArrayMapper).every(f => f(e));
    }
    if (conditional?.anyOf) {
      return conditional.anyOf.map(conditionsArrayMapper).some(f => f(e));
    }
    if (conditional?.oneOf) {
      return (
        conditional.oneOf.map(conditionsArrayMapper).filter(f => f(e))
          .length === 1
      );
    }
    return true;
  };

async function extractDynamicConfig() {
  // Extract routes lists and app bindings from the app config file
  const appsConfig = await defaultConfigLoader();
  const dynamicConfig = (appsConfig as AppConfig[]).reduce<{
    routeBindings: RouteBinding[];
    dynamicRoutes: DynamicRoute[];
    appIcons: AppIcon[];
    mountPoints: MountPoint[];
  }>(
    (acc, { data }) => {
      if (data?.dynamicPlugins?.frontend) {
        acc.dynamicRoutes.push(
          ...Object.entries(data.dynamicPlugins.frontend).reduce<
            DynamicRoute[]
          >((pluginSet, [scope, customProperties]) => {
            pluginSet.push(
              ...(customProperties.dynamicRoutes ?? []).map(route => ({
                ...route,
                module: route.module ?? 'PluginRoot',
                importName: route.importName ?? 'default',
                scope,
              })),
            );
            return pluginSet;
          }, []),
        );
        acc.routeBindings.push(
          ...Object.entries(data.dynamicPlugins.frontend).reduce<
            RouteBinding[]
          >((pluginSet, [_, customProperties]) => {
            pluginSet.push(...(customProperties.routeBindings ?? []));
            return pluginSet;
          }, []),
        );

        acc.mountPoints.push(
          ...Object.entries(data.dynamicPlugins.frontend).reduce<MountPoint[]>(
            (accMountPoints, [scope, { mountPoints }]) => {
              accMountPoints.push(
                ...(mountPoints ?? []).map(point => ({
                  ...point,
                  module: point.module ?? 'PluginRoot',
                  importName: point.importName ?? 'default',
                  scope,
                })),
              );
              return accMountPoints;
            },
            [],
          ),
        );

        acc.appIcons.push(
          ...Object.entries(data.dynamicPlugins.frontend).reduce<AppIcon[]>(
            (accAppIcons, [scope, { appIcons }]) => {
              accAppIcons.push(
                ...(appIcons ?? []).map(icon => ({
                  ...icon,
                  module: icon.module ?? 'PluginRoot',
                  importName: icon.importName ?? 'default',
                  scope,
                })),
              );
              return accAppIcons;
            },
            [],
          ),
        );
      }
      return acc;
    },
    { routeBindings: [], dynamicRoutes: [], mountPoints: [], appIcons: [] },
  ) || { routeBindings: [], dynamicRoutes: [], mountPoints: [], appIcons: [] }; // fallback to empty arrays

  return dynamicConfig;
}

export default extractDynamicConfig;
