/**
 * Package Manager Adapter for Nemesis Enforcement Engine
 * Adapta comandos entre diferentes gerenciadores de pacotes
 */

import type { EnvironmentInfo } from '../detectors/environment-detector'

export interface CommandMapping {
  original: string
  adapted: string
  packageManager: string
}

export interface AdaptedCommand {
  command: string
  args: string[]
  packageManager: string
  originalCommand: string
}

export class PackageManagerAdapter {
  private environment: EnvironmentInfo

  constructor(environment: EnvironmentInfo) {
    this.environment = environment
  }

  /**
   * Mapeia comandos Yarn para o gerenciador detectado
   */
  adaptCommand(yarnCommand: string): AdaptedCommand {
    const { packageManager } = this.environment

    // Se já for o gerenciador correto, retorna como está
    if (packageManager === 'yarn') {
      return {
        command: 'yarn',
        args: yarnCommand.replace(/^yarn\s*/, '').split(' ').filter(Boolean),
        packageManager,
        originalCommand: yarnCommand
      }
    }

    // Mapeamentos específicos por gerenciador
    switch (packageManager) {
      case 'bun':
        return this.adaptToBun(yarnCommand)
      case 'npm':
        return this.adaptToNpm(yarnCommand)
      case 'pnpm':
        return this.adaptToPnpm(yarnCommand)
      default:
        throw new Error(`Package manager ${packageManager} not supported for command adaptation`)
    }
  }

  private adaptToBun(yarnCommand: string): AdaptedCommand {
    const command = yarnCommand.replace(/^yarn\s*/, '')
    
    // Mapeamentos comuns Yarn → Bun
    const mappings: Record<string, string> = {
      'install': 'install',
      'add': 'add',
      'remove': 'remove',
      'run': 'run',
      'dev': 'run dev',
      'build': 'run build',
      'start': 'start',
      'test': 'test',
      'lint': 'run lint',
      'type-check': 'run type-check',
      'tsc --noEmit': 'tsc --noEmit',
      'generate:component': 'run generate:component'
    }

    // Verificar se é um comando direto ou script
    if (mappings[command]) {
      const adaptedCommand = mappings[command]
      const [cmd, ...args] = adaptedCommand.split(' ')
      
      return {
        command: 'bun',
        args,
        packageManager: 'bun',
        originalCommand: yarnCommand
      }
    }

    // Se é um script (yarn run <script>)
    if (command.startsWith('run ')) {
      const scriptName = command.replace('run ', '')
      return {
        command: 'bun',
        args: ['run', scriptName],
        packageManager: 'bun',
        originalCommand: yarnCommand
      }
    }

    // Comandos de instalação de dependências
    if (command.startsWith('add ')) {
      const packages = command.replace('add ', '').split(' ')
      return {
        command: 'bun',
        args: ['add', ...packages],
        packageManager: 'bun',
        originalCommand: yarnCommand
      }
    }

    // Comandos de dev dependencies
    if (command.startsWith('add -D ')) {
      const packages = command.replace('add -D ', '').split(' ')
      return {
        command: 'bun',
        args: ['add', '-d', ...packages],
        packageManager: 'bun',
        originalCommand: yarnCommand
      }
    }

    // Fallback - tenta executar diretamente
    return {
      command: 'bun',
      args: command.split(' ').filter(Boolean),
      packageManager: 'bun',
      originalCommand: yarnCommand
    }
  }

  private adaptToNpm(yarnCommand: string): AdaptedCommand {
    const command = yarnCommand.replace(/^yarn\s*/, '')
    
    // Mapeamentos comuns Yarn → npm
    const mappings: Record<string, string> = {
      'install': 'install',
      'add': 'install',
      'remove': 'uninstall',
      'dev': 'run dev',
      'build': 'run build',
      'start': 'start',
      'test': 'test',
      'lint': 'run lint',
      'type-check': 'run type-check',
      'tsc --noEmit': 'run tsc --noEmit',
      'generate:component': 'run generate:component'
    }

    if (mappings[command]) {
      const adaptedCommand = mappings[command]
      const [cmd, ...args] = adaptedCommand.split(' ')
      
      return {
        command: 'npm',
        args,
        packageManager: 'npm',
        originalCommand: yarnCommand
      }
    }

    // Se é um script (yarn run <script>)
    if (command.startsWith('run ')) {
      const scriptName = command.replace('run ', '')
      return {
        command: 'npm',
        args: ['run', scriptName],
        packageManager: 'npm',
        originalCommand: yarnCommand
      }
    }

    // Comandos de instalação de dependências
    if (command.startsWith('add ')) {
      const packages = command.replace('add ', '').split(' ')
      return {
        command: 'npm',
        args: ['install', ...packages],
        packageManager: 'npm',
        originalCommand: yarnCommand
      }
    }

    // Comandos de dev dependencies
    if (command.startsWith('add -D ')) {
      const packages = command.replace('add -D ', '').split(' ')
      return {
        command: 'npm',
        args: ['install', '--save-dev', ...packages],
        packageManager: 'npm',
        originalCommand: yarnCommand
      }
    }

    // Fallback
    return {
      command: 'npm',
      args: command.split(' ').filter(Boolean),
      packageManager: 'npm',
      originalCommand: yarnCommand
    }
  }

  private adaptToPnpm(yarnCommand: string): AdaptedCommand {
    const command = yarnCommand.replace(/^yarn\s*/, '')
    
    // Mapeamentos comuns Yarn → pnpm
    const mappings: Record<string, string> = {
      'install': 'install',
      'add': 'add',
      'remove': 'remove',
      'dev': 'dev',
      'build': 'build',
      'start': 'start',
      'test': 'test',
      'lint': 'lint',
      'type-check': 'type-check',
      'tsc --noEmit': 'type-check',
      'generate:component': 'generate:component'
    }

    if (mappings[command]) {
      const adaptedCommand = mappings[command]
      const [cmd, ...args] = adaptedCommand.split(' ')
      
      return {
        command: 'pnpm',
        args,
        packageManager: 'pnpm',
        originalCommand: yarnCommand
      }
    }

    // Se é um script (yarn run <script>)
    if (command.startsWith('run ')) {
      const scriptName = command.replace('run ', '')
      return {
        command: 'pnpm',
        args: ['run', scriptName],
        packageManager: 'pnpm',
        originalCommand: yarnCommand
      }
    }

    // Comandos de instalação de dependências
    if (command.startsWith('add ')) {
      const packages = command.replace('add ', '').split(' ')
      return {
        command: 'pnpm',
        args: ['add', ...packages],
        packageManager: 'pnpm',
        originalCommand: yarnCommand
      }
    }

    // Comandos de dev dependencies
    if (command.startsWith('add -D ')) {
      const packages = command.replace('add -D ', '').split(' ')
      return {
        command: 'pnpm',
        args: ['add', '-D', ...packages],
        packageManager: 'pnpm',
        originalCommand: yarnCommand
      }
    }

    // Fallback
    return {
      command: 'pnpm',
      args: command.split(' ').filter(Boolean),
      packageManager: 'pnpm',
      originalCommand: yarnCommand
    }
  }

  /**
   * Adapta múltiplos comandos em lote
   */
  adaptCommands(yarnCommands: string[]): AdaptedCommand[] {
    return yarnCommands.map(cmd => this.adaptCommand(cmd))
  }

  /**
   * Verifica se um comando precisa de adaptação
   */
  needsAdaptation(command: string): boolean {
    return command.startsWith('yarn') && this.environment.packageManager !== 'yarn'
  }

  /**
   * Retorna o comando original formatado para exibição
   */
  formatOriginalCommand(adaptedCommand: AdaptedCommand): string {
    return `${adaptedCommand.packageManager} ${adaptedCommand.args.join(' ')}`
  }
}
