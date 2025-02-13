using Microsoft.ML.Data;

namespace ReceiptsApp.Server.MLModels
{
    public class LinePrediction
    {
        [ColumnName("PredictedLabel")]
        public string PredictedLineLabel { get; set; }
        public float[] Score { get; set; }
    }
}
