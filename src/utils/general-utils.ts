import { CollectibleStatus } from "../interfaces/dtos/CollectibleItemDto";
  
  // A switch that returns a string based on the status
  export function statusFormatter(status: CollectibleStatus) {
    switch (status) {
      case CollectibleStatus.NotStarted:
        return 'Not Started';
      case CollectibleStatus.InProgress:
        return 'In Progress';
      case CollectibleStatus.Completed:
        return 'Completed';
      default:
        return '';
    }
  }