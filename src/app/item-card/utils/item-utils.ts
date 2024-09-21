import { faHourglassStart, faBookOpen, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { CollectibleStatus } from "../../../interfaces/dtos/CollectibleItemDto";

export var statuses: {
    label: string;
    value: CollectibleStatus;
    icon: any;
    btnClass: string;
    btnFillClass: string;
}[] = [
        {
            label: '',
            value: CollectibleStatus.NotStarted,
            icon: faHourglassStart,
            btnClass: 'btn-outline-warning',
            btnFillClass: 'btn-warning',
        },
        {
            label: '',
            value: CollectibleStatus.InProgress,
            icon: faBookOpen,
            btnClass: 'btn-outline-primary',
            btnFillClass: 'btn-primary',
        },
        {
            label: '',
            value: CollectibleStatus.Completed,
            icon: faCheckCircle,
            btnClass: 'btn-outline-success',
            btnFillClass: 'btn-success',
        },
    ];