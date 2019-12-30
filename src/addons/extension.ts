import { ExtensionAPI } from './extension-api';
import { BitId, BitIds } from '../bit-id';
import { CACHE_ROOT } from '../constants';
import path from 'path';
import { loadConsumer } from '../consumer';
import { BitCapsule } from '../capsule';
import { default as CapsuleBuilder, Options } from '../environment/capsule-builder';

export type UserExtension = {
  run: (api: ExtensionAPI) => Promise<void>;
  show?: (api: ExtensionAPI) => Promise<void>;
  defineDependencies?: (api: ExtensionAPI) => Promise<void>;
};

export type UserExtensionFactory = () => UserExtension;

export async function importExtensionObject(id: BitId) {
  const module = await loadComponent(id);
  return ((module as any) as UserExtensionFactory)();
}

export async function installComponents(ids: BitId[]): Promise<any[]> {
  const consumer = await loadConsumer();
  const invalidComponents = (await consumer.componentLoader.loadMany(new BitIds(...ids), false)).invalidComponents;
  const components = await Promise.all(invalidComponents.map(component => installComponent(component.id)));
  return components;
}

export async function installComponent(id: BitId) {
  const capsule = await createComponentCapsule(id);
  const isInstalled = await isComponentInstalled(capsule);
  console.log('after bit install', isInstalled);
  if (!isInstalled) {
    try {
      console.log('try!!!!!!!');
      await capsule.exec({ command: 'npm init --yes'.split(' ') });
      const npmId = `@bit/${id
        .toString()
        .split('/')
        .join('.')}`;
      console.log('work directory', capsule.wrkDir);
      const command = `npm i ${npmId}`.split(' ');
      console.log('command', '"', command.join(' '), '"');
      await capsule.exec({ command: command });
      const z = await capsule.fs.promises.writeFile(
        path.join(capsule.wrkDir, 'index.js'),
        `module.exports = require('${npmId}');`
      );
      // await capsule.outputFile('index.js', `module.exports = require('${npmId}')`,{})
    } catch (e) {
      console.log('wow');
      debugger;
    }
  }
  console.log('work directory', capsule.wrkDir);
  return capsule;
}

export async function createComponentCapsule(id: BitId) {
  const componentDir = path.join(CACHE_ROOT, 'components');
  const builder = new CapsuleBuilder(componentDir);
  return builder.createCapsule(id);
}

export async function isComponentInstalled(id: BitId | BitCapsule): Promise<boolean> {
  const capsule = id instanceof BitId ? await createComponentCapsule(id) : id;
  const packageJsonPath = path.join(capsule.wrkDir, 'package.json');
  return canBeRequired(packageJsonPath);
}

export async function loadComponent(id: BitId) {
  const capsule = await installComponent(id);
  let component = null;
  try {
    component = require(capsule.wrkDir);
  } catch (e) {
    debugger;
    console.log('~~~~~~~~~~~~~~~~~~~~~~ERROR~~~~~~~~~~~~~~~~~~~~~~~~~``');
  }
  return component!;
}

export function canBeRequired(id: string) {
  debugger;
  let canRequire = true;
  try {
    require.resolve(id);
  } catch (e) {
    canRequire = false;
  }
  return canRequire;
}
