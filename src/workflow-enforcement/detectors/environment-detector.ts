/**
 * Environment Detector for Nemesis Enforcement Engine
 * Detecta OS e gerenciador de pacotes para compatibilidade multi-ambiente
 */

/// <reference path="../../../scripts/types/node-globals.d.ts" />

import { existsSync, readFileSync } from 'fs'
import { execSync } from 'child_process'

export interface EnvironmentInfo {
  os: 'mac' | 'windows' | 'linux'
  packageManager: 'yarn' | 'bun' | 'npm' | 'pnpm' | 'unknown'
  hasLockFile: boolean
  lockFileType: 'yarn.lock' | 'bun.lockb' | 'package-lock.json' | 'pnpm-lock.yaml' | 'none'
  nodeVersion: string
  packageManagerVersion: string
}

export function detectOS(): 'mac' | 'windows' | 'linux' {
  const platform = process.platform
  
  if (platform === 'darwin') return 'mac'
  if (platform === 'win32') return 'windows'
  if (platform === 'linux') return 'linux'
  
  // Fallback para ambientes uncommon
  throw new Error(`Unsupported OS: ${platform}`)
}

export function detectPackageManager(): 'yarn' | 'bun' | 'npm' | 'pnpm' | 'unknown' {
  try {
    // Verificar se yarn está disponível globalmente
    execSync('yarn --version', { stdio: 'ignore' })
    return 'yarn'
  } catch {}
  
  try {
    // Verificar se bun está disponível globalmente
    execSync('bun --version', { stdio: 'ignore' })
    return 'bun'
  } catch {}
  
  try {
    // Verificar se npm está disponível (sempre vem com Node.js)
    execSync('npm --version', { stdio: 'ignore' })
    return 'npm'
  } catch {}
  
  try {
    // Verificar se pnpm está disponível
    execSync('pnpm --version', { stdio: 'ignore' })
    return 'pnpm'
  } catch {}
  
  return 'unknown'
}

export function detectLockFile(): EnvironmentInfo['lockFileType'] {
  if (existsSync('yarn.lock')) return 'yarn.lock'
  if (existsSync('bun.lockb')) return 'bun.lockb'
  if (existsSync('package-lock.json')) return 'package-lock.json'
  if (existsSync('pnpm-lock.yaml')) return 'pnpm-lock.yaml'
  return 'none'
}

export function getNodeVersion(): string {
  try {
    return execSync('node --version', { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

export function getPackageManagerVersion(packageManager: string): string {
  try {
    return execSync(`${packageManager} --version`, { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

export function detectEnvironment(): EnvironmentInfo {
  const os = detectOS()
  const packageManager = detectPackageManager()
  const lockFileType = detectLockFile()
  const hasLockFile = lockFileType !== 'none'
  const nodeVersion = getNodeVersion()
  const packageManagerVersion = getPackageManagerVersion(packageManager)

  return {
    os,
    packageManager,
    hasLockFile,
    lockFileType,
    nodeVersion,
    packageManagerVersion
  }
}

export function validateEnvironmentCompatibility(env: EnvironmentInfo): {
  compatible: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []

  // Verificar compatibilidade básica
  if (env.packageManager === 'unknown') {
    issues.push('Nenhum gerenciador de pacotes compatível encontrado')
    recommendations.push('Instalar Yarn, Bun, npm ou pnpm')
  }

  if (!env.hasLockFile) {
    issues.push('Nenhum arquivo de lock encontrado')
    recommendations.push('Executar install do gerenciador de pacotes para criar lock file')
  }

  // Verificar consistência entre lock file e package manager detectado
  if (env.hasLockFile && env.packageManager !== 'unknown') {
    const expectedLockFile = `${env.packageManager}.lock`
    if (env.packageManager === 'bun' && env.lockFileType !== 'bun.lockb') {
      issues.push(`Detectado Bun mas lock file é ${env.lockFileType}`)
      recommendations.push('Usar "bun install" para criar bun.lockb')
    }
    if (env.packageManager === 'yarn' && env.lockFileType !== 'yarn.lock') {
      issues.push(`Detectado Yarn mas lock file é ${env.lockFileType}`)
      recommendations.push('Usar "yarn install" para criar yarn.lock')
    }
    if (env.packageManager === 'npm' && env.lockFileType !== 'package-lock.json') {
      issues.push(`Detectado npm mas lock file é ${env.lockFileType}`)
      recommendations.push('Usar "npm install" para criar package-lock.json')
    }
    if (env.packageManager === 'pnpm' && env.lockFileType !== 'pnpm-lock.yaml') {
      issues.push(`Detectado pnpm mas lock file é ${env.lockFileType}`)
      recommendations.push('Usar "pnpm install" para criar pnpm-lock.yaml')
    }
  }

  // Verificar versão do Node.js
  const nodeVersionMatch = env.nodeVersion.match(/^v(\d+)\./)
  if (nodeVersionMatch) {
    const majorVersion = parseInt(nodeVersionMatch[1])
    if (majorVersion < 18) {
      issues.push(`Node.js v${majorVersion} é muito antigo`)
      recommendations.push('Atualizar para Node.js 18+ para compatibilidade completa')
    }
  }

  const compatible = issues.length === 0

  return {
    compatible,
    issues,
    recommendations
  }
}
