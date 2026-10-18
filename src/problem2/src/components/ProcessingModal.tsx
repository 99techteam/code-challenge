import { Modal, Spin, Typography } from 'antd';
export function ProcessingModal({ open }: { open: boolean }) {
    return (
        <Modal open={open} footer={null} closable={false} centered>
            <div className="processing">
                <Spin size="large" />
                <Typography.Title level={4}>Converting currencies…</Typography.Title>
                <Typography.Text type="secondary">Caveman calculate. Please wait.</Typography.Text>
            </div>
        </Modal>
    );
}
