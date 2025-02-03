// scripts/controllers.ts
import { Request, Response } from 'express';
import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import Script from './models';
import History from '../history/models';
import { sendRestResponse } from '../../utils/rest';
import logger from '../../utils/logger';
import { getDiffHistory } from '../../features/history/utils';

// Define the directory where scripts will be saved
const SCRIPTS_DIR = path.join(__dirname, '../../opt/cronos/scripts');

// Ensure the directory exists
if (!fs.existsSync(SCRIPTS_DIR)) {
  fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
}

// region Script createOne
export const createScript = async (req: Request, res: Response) => {
  try {
    const { name, description, content, language, tags } = req.body;
    const createdBy = req.user?.userId;

    // Validate the user
    if (!createdBy) {
      return sendRestResponse({
        status: 401,
        message: 'Unauthorized',
        res,
      });
    }

    // Define the path where the script file will be saved
    const fileName = `${name}_${createdBy}_${Date.now()}.sh`;
    const filePath = path.join(SCRIPTS_DIR, fileName);

    // Write the script content to the file
    fs.writeFileSync(filePath, content);

    // Save the script metadata in the database
    const script = new Script({
      name,
      description,
      path: filePath,
      language,
      createdBy,
      tags,
    });
    await script.save();
    await History.create({
      user: createdBy,
      actionType: 'created',
      entityId: script._id,
      entityType: 'Script',
    });

    return sendRestResponse({
      status: 201,
      message: 'Script created successfully',
      data: script,
      res,
    });
  } catch (error) {
    logger.error(`Error creating script: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Error creating script',
      res,
    });
  }
};

// region Script  getAll
export const getAllScripts = async (_req: Request, res: Response) => {
  try {
    const scripts = await Script.find().populate(
      'createdBy',
      'firstName lastName email'
    );

    // add content to scripts
    let scriptsWithContent = [] as (typeof scripts)[] & { content: string }[];
    scripts.forEach((script) => {
      const content = fs.readFileSync(script.path, 'utf-8');
      scriptsWithContent.push({ ...script.toObject(), content });
    });
    return sendRestResponse({
      status: 200,
      message: 'Success',
      data: scriptsWithContent,
      res,
    });
  } catch (error) {
    logger.error(`Error fetching scripts: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Error fetching scripts',
      res,
    });
  }
};
// endregion

// region Script getById
export const getScriptById = async (req: Request, res: Response) => {
  try {
    const script = await Script.findById(req.params.id).populate(
      'createdBy',
      'firstName lastName email'
    );
    if (!script) {
      return sendRestResponse({
        status: 404,
        message: 'Script not found',
        res,
      });
    }

    // Read the script content from the file
    const content = fs.readFileSync(script.path, 'utf-8');
    const scriptWithContent = { ...script.toObject(), content };

    return sendRestResponse({
      status: 200,
      message: 'Success',
      data: scriptWithContent,
      res,
    });
  } catch (error) {
    logger.error(`Error fetching script: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Error fetching script',
      res,
    });
  }
};
// endregion

// region Script update
export const updateScript = async (req: Request, res: Response) => {
  try {
    const { name, description, content, language, tags } = req.body;
    const script = await Script.findById(req.params.id);

    if (!script) {
      return sendRestResponse({
        status: 404,
        message: 'Script not found',
        res,
      });
    }

    // Update script metadata
    if (name) script.name = name;
    if (description) script.description = description;
    if (language) script.language = language;
    if (tags) script.tags = tags;

    // Update the script file content if provided
    if (content) {
      fs.writeFileSync(script.path, content);
    }

    const updatedScript = await Script.findByIdAndUpdate(
      req.params.id,
      script,
      { new: true }
    );

    await History.create({
      user: req.user?.userId,
      actionType: 'updated',
      entityId: script._id,
      entityType: 'Script',
      diff: getDiffHistory(script, updatedScript),
    });
    return sendRestResponse({
      status: 200,
      message: 'Script updated successfully',
      data: script,
      res,
    });
  } catch (error) {
    logger.error(`Error updating script: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Error updating script',
      res,
    });
  }
};
// endregion

// region Script deletion
export const deleteScript = async (req: Request, res: Response) => {
  try {
    const script = await Script.findById(req.params.id);
    if (!script) {
      return sendRestResponse({
        status: 404,
        message: 'Script not found',
        res,
      });
    }

    // Delete the script file from the server
    if (fs.existsSync(script.path)) {
      fs.unlinkSync(script.path);
    }

    // Delete the script record from the database
    await script.deleteOne();

    await History.create({
      user: req.user?.userId,
      actionType: 'deleted',
      entityId: script._id,
      entityType: 'Script',
    });

    return sendRestResponse({
      status: 200,
      message: 'Script deleted successfully',
      res,
    });
  } catch (error) {
    logger.error(`Error deleting script: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Error deleting script',
      res,
    });
  }
};
// endregion

// region Script testing
export const testScript = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const script = await Script.findById(id);

    if (!script) {
      return sendRestResponse({
        res,
        status: 404,
        message: 'Script not found',
      });
    }

    const scriptPath = path.resolve(script.path);

    if (!fs.existsSync(scriptPath)) {
      return sendRestResponse({
        res,
        status: 404,
        message: 'Script file not found',
      });
    }

    if (process.platform === 'win32') {
      windowsRunDockerCommand(scriptPath, res);
    } else {
      linuxRunDockerCommand(scriptPath, res);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return sendRestResponse({
      res,
      status: 500,
      message: 'Error executing script',
    });
  }
};
// endregion

// region Script execution: Linux
async function linuxRunDockerCommand(
  scriptFilePath: string,
  res: Response<any, Record<string, any>>
) {
  const execAsync = util.promisify(exec);
  try {
    const command = `
      docker run --rm \
      --memory=100m --cpus="0.5" \
      -v ${scriptFilePath}:/scripts/script.sh \
      script-runner bash /scripts/script.sh
    `;

    // Execute the command
    const { stdout, stderr } = await execAsync(command, {
      timeout: 10000, // 10 seconds
    });

    logger.info('Script tested successfully with output:', stdout, stderr);

    return sendRestResponse({
      res,
      status: 200,
      message: 'Script tested successfully',
      data: { stdout, stderr },
    });
  } catch (error) {
    const errorMessage = error.killed
      ? 'Script execution timed out'
      : error.message;

    logger.error(`Error executing script: ${errorMessage}`);

    return sendRestResponse({
      res,
      status: 500,
      message: 'Error executing script',
    });
  }
}
// endregion

// region Script execution: Windows
function windowsRunDockerCommand(
  scriptFilePath: string,
  res: Response<any, Record<string, any>>
) {
  const scriptFileName = path.basename(scriptFilePath);
  const scriptFileDir = path.dirname(scriptFilePath);

  const dockerMountPath = `/host_mnt${scriptFileDir
    .replace(/\\/g, '/')
    .replace('C:', '/c')}`;
  try {
    // Build the Docker command
    const command = `docker run --rm --memory=100m --cpus="0.5" -v "${dockerMountPath}:/scripts" script-runner bash /scripts/${scriptFileName}`;

    console.log('Executing PowerShell command:', command);
    logger.info('Executing PowerShell command:', command);

    // Spawn a PowerShell process
    const ps = spawn('powershell.exe', ['-Command', command]);

    let stdout = '';
    let stderr = '';

    ps.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ps.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ps.on('close', (code) => {
      console.log(`PowerShell process exited with code: ${code}`);
      logger.info(`PowerShell process exited with code: ${code}`);
      if (code === 0) {
        return sendRestResponse({
          res,
          status: 200,
          message: 'Script tested successfully',
          data: { stdout, stderr },
        });
      } else {
        return sendRestResponse({
          res,
          status: 500,
          message: `Script execution failed with exit code: ${code}`,
          data: { stdout, stderr },
        });
      }
    });

    ps.on('error', (error) => {
      logger.error(`PowerShell execution error: ${error.message}`);
      console.error('PowerShell execution error:', error.message);
      return sendRestResponse({
        res,
        status: 500,
        message: 'Error executing script',
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    logger.error(`Error executing script: ${error.message}`);
    return sendRestResponse({
      res,
      status: 500,
      message: 'Error executing script',
    });
  }
}
