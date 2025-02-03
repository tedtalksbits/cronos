import deepDiff from 'deep-diff';
interface DiffChange {
  kind: string;
  path: (string | number)[];
  lhs?: any;
  rhs?: any;
}

export const getDiffHistory = (oldData: any, newData: any) => {
  console.log('Old data:', oldData);
  console.log('New data:', newData);
  const diff = deepDiff.diff(oldData, newData) as DiffChange[];
  if (!diff) return null;

  const cleanedDiff = cleanDiff(diff);
  const formattedDiff = formatDiff(cleanedDiff);

  return formattedDiff;
};

function cleanDiff(diff: DiffChange[]): DiffChange[] {
  if (!diff) return [];
  return diff.filter((change) => {
    // Filter out internal Mongoose fields (such as $__)
    return !change.path.some(
      (p) =>
        p.toString().startsWith('$__') ||
        p === 'activePaths' ||
        p === 'states' ||
        p.toString().startsWith('$')
    );
  });
}

function formatDiff(diff: DiffChange[]) {
  return diff.map((change) => {
    if (change.kind === 'E') {
      // 'E' means the field was modified
      return {
        field: change.path[change.path.length - 1] as string, // Use the last element of the path as the field name
        oldValue: change.lhs,
        newValue: change.rhs,
      };
    } else if (change.kind === 'N') {
      // 'N' means a new field was added
      return {
        field: change.path[change.path.length - 1] as string, // Field name
        oldValue: null,
        newValue: change.rhs,
      };
    } else if (change.kind === 'D') {
      // 'D' means a field was deleted
      return {
        field: change.path[change.path.length - 1] as string, // Field name
        oldValue: change.lhs,
        newValue: null,
      };
    } else if (change.kind === 'A') {
      console.log('Array modified:', change);
      // 'A' means an array was modified
      return {
        field: change.path[change.path.length - 1] as string, // Field name
        oldValue: change.lhs,
        newValue: change.rhs,
      };
    } else {
      return null;
    }
  });
}
