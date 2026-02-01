import { PermissionRequest, Violation } from './types';

export class PermissionGate {
  private static pendingRequests: PermissionRequest[] = [];
  private static grantedPermissions: Set<string> = new Set();
  private static deniedPermissions: Set<string> = new Set();

  static async requestPermission(request: PermissionRequest): Promise<boolean> {
    const requestKey = this.generateRequestKey(request);

    // Check if already decided
    if (this.grantedPermissions.has(requestKey)) {
      return true;
    }
    if (this.deniedPermissions.has(requestKey)) {
      return false;
    }

    // Add to pending requests
    this.pendingRequests.push(request);

    // For now, auto-approve safe commands and require confirmation for risky ones
    const isSafe = this.isSafeCommand(request.command);
    
    if (isSafe && !request.requiresConfirmation) {
      this.grantedPermissions.add(requestKey);
      return true;
    }

    // For risky commands, require explicit confirmation
    if (request.requiresConfirmation) {
      // In a real implementation, this would prompt the user
      // For now, we'll log and deny by default
      console.warn(`Permission required for command: ${request.command}`);
      console.warn(`Reason: ${request.reason}`);
      console.warn(`Workflow: ${request.workflow}`);
      
      this.deniedPermissions.add(requestKey);
      return false;
    }

    return false;
  }

  private static generateRequestKey(request: PermissionRequest): string {
    return `${request.workflow}:${request.command}`;
  }

  private static isSafeCommand(command: string): boolean {
    const dangerousPatterns = [
      /rm\s+-rf/,           // Dangerous remove
      /sudo\s+/,            // Privileged commands
      /format\s+/,          // Format commands
      /dd\s+if=/,           // Disk imaging
      />\s*\/dev\/null/,    // Redirecting to null
      /kill\s+-9/,          // Force kill
      /shutdown/,           // Shutdown commands
      /reboot/,             // Reboot commands
      /passwd/,             // Password changes
      /chmod\s+777/,        // Dangerous permissions
      /chown\s+root/,       // Ownership changes
    ];

    const safePatterns = [
      /^ls\s/,              // List files
      /^cat\s/,             // Read files
      /^echo\s/,            // Echo commands
      /^mkdir\s/,           // Create directories
      /^touch\s/,           // Create files
      /^cp\s/,              // Copy files (not recursive)
      /^mv\s/,              // Move files
      /^grep\s/,            // Search
      /^find\s/,            // Find files
      /^npm\s+(install|list|info)/, // Safe npm commands
      /^yarn\s+(install|list|info)/, // Safe yarn commands
    ];

    // Check for dangerous patterns
    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return false;
      }
    }

    // Check for safe patterns
    for (const pattern of safePatterns) {
      if (pattern.test(command)) {
        return true;
      }
    }

    // Default to unsafe for unknown commands
    return false;
  }

  static createPermissionRequest(
    command: string,
    reason: string,
    workflow: string,
    requiresConfirmation: boolean = false
  ): PermissionRequest {
    return {
      command,
      reason,
      workflow,
      requiresConfirmation
    };
  }

  static getPendingRequests(): PermissionRequest[] {
    return [...this.pendingRequests];
  }

  static clearPendingRequests(): void {
    this.pendingRequests = [];
  }

  static grantPermission(request: PermissionRequest): void {
    const requestKey = this.generateRequestKey(request);
    this.grantedPermissions.add(requestKey);
  }

  static denyPermission(request: PermissionRequest): void {
    const requestKey = this.generateRequestKey(request);
    this.deniedPermissions.add(requestKey);
  }

  static reset(): void {
    this.pendingRequests = [];
    this.grantedPermissions.clear();
    this.deniedPermissions.clear();
  }

  static checkCommandSafety(command: string): {
    isSafe: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    reasons: string[];
  } {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check for file operations
    if (/rm\s+/.test(command)) {
      reasons.push('File deletion operation');
      riskLevel = 'medium';
    }

    // Check for privileged operations
    if (/sudo\s+/.test(command)) {
      reasons.push('Privileged operation requiring sudo');
      riskLevel = 'high';
    }

    // Check for system operations
    if (/systemctl|service|shutdown|reboot/.test(command)) {
      reasons.push('System-level operation');
      riskLevel = 'high';
    }

    // Check for network operations
    if (/curl|wget|nc|netcat/.test(command)) {
      reasons.push('Network operation');
      riskLevel = 'medium';
    }

    // Check for package operations
    if (/npm\s+(uninstall|publish)|yarn\s+(remove|publish)/.test(command)) {
      reasons.push('Package management operation');
      riskLevel = 'medium';
    }

    return {
      isSafe: riskLevel === 'low',
      riskLevel,
      reasons
    };
  }
}
