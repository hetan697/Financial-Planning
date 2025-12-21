import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, message, Modal } from 'antd';
import { useEffect } from 'react';

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    useEffect(() => {
        if (offlineReady) {
            message.success('应用已准备好离线工作');
            close();
        }
    }, [offlineReady]);

    useEffect(() => {
        if (needRefresh) {
            Modal.confirm({
                title: '发现新版本',
                content: '有新的内容可用，即刻更新？',
                okText: '立即更新',
                cancelText: '稍后',
                onOk: () => {
                    updateServiceWorker(true);
                },
                onCancel: () => {
                    close();
                },
            });
        }
    }, [needRefresh, updateServiceWorker]);

    return null;
}

export default ReloadPrompt;
