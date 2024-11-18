// createDialog.ts
import { createRoot } from 'react-dom/client';
import ConfirmDialog from './confirm-dialog';

const createDialog = ({
  title,
  details,
}: {
  title: string | React.ReactNode;
  details: string | React.ReactNode;
}) => {
  return new Promise<boolean>((resolve) => {
    const dialogRoot = document.createElement('div');
    document.body.appendChild(dialogRoot);
    // Create a root for the new dialog
    const root = createRoot(dialogRoot); // Create a root

    const closeDialog = (result: boolean) => {
      // Cleanup
      root.unmount();
      document.body.removeChild(dialogRoot);
      resolve(result);
    };

    const dialogElement = (
      <ConfirmDialog
        open={true}
        heading={title}
        details={details}
        onClose={() => closeDialog(false)}
        onConfirm={() => closeDialog(true)}
      />
    );

    root.render(dialogElement);
  });
};

export default createDialog;
