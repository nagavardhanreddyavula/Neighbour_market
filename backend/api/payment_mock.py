import time
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order
from .serializers import OrderSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mock_payment_process(request):
    """
    Accepts an Order ID (or list of Order IDs), simulates payment gateway delay,
    and updates the Order status to 'Processing'.
    """
    order_id = request.data.get('order_id')
    order_ids = request.data.get('order_ids', [])

    if order_id:
        order_ids.append(order_id)

    if not order_ids:
        return Response(
            {'error': 'order_id or order_ids parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Simulate payment gateway processing delay (e.g. 1 second)
    time.sleep(1.0)

    updated_orders = []
    for oid in order_ids:
        try:
            order = Order.objects.get(id=oid, user=request.user)
            order.status = 'Processing'
            order.save()
            updated_orders.append(order)
        except Order.DoesNotExist:
            continue

    if not updated_orders:
        return Response({'error': 'No matching orders found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'message': 'Payment successful. Order is now processing.',
        'transaction_id': f'MOCK_TXN_{int(time.time())}',
        'status': 'SUCCESS',
        'orders': OrderSerializer(updated_orders, many=True).data
    }, status=status.HTTP_200_OK)
