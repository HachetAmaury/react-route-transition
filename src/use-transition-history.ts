import { TPathOrPaths } from './types';
import { useContext } from 'react';
import * as History from 'history';
import { TransitionContext } from './TransitionProvider';

function arrarizePath(pathOrPaths: TPathOrPaths) {
  return typeof pathOrPaths === 'string' ? [pathOrPaths] : pathOrPaths ?? [];
}

function hasPath(pathOrPaths: TPathOrPaths, path: History.Path) {
  const pathsArray = arrarizePath(pathOrPaths);

  if (pathsArray.indexOf('*') !== -1) {
    return true;
  }

  return pathsArray.indexOf(path) !== -1;
}

export default function() {
  const { listeners, location, push } = useContext(TransitionContext);

  return {
    push: async (path: History.Path, state?: History.LocationState) => {
      if (path !== location.pathname) {
        await Promise.all(
          listeners
            .filter(
              listener =>
                hasPath(listener.path, location.pathname) ||
                (hasPath(listener.from, location.pathname) &&
                  hasPath(listener.to, path))
            )
            .filter(listener => !!listener.onLeave)
            .map(listener => listener.onLeave!())
        );
      }

      push(path, state);

      if (path !== location.pathname) {
        await Promise.all(
          listeners
            .filter(
              listener =>
                hasPath(listener.path, path) ||
                (hasPath(listener.from, location.pathname) &&
                  hasPath(listener.to, path))
            )
            .filter(listener => !!listener.onEnter)
            .map(listener => listener.onEnter!())
        );
      }
    },
  };
}